import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requirePocketBaseAuth } from "@/integrations/pocketbase/auth-middleware";
import { getPbAdmin } from "@/integrations/pocketbase/client.server";
import type { RecordModel } from "pocketbase";

const recordId = z.string().min(1);
const roleSchema = z.enum(["student", "artisan", "admin"]);
const requireAdmin = (role?: string) => {
  if (role !== "admin") throw new Error("Forbidden: admin role required");
};
const admin = async () => getPbAdmin();
const normalizeAttachments = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((file): file is string => typeof file === "string");
  return typeof value === "string" && value ? [value] : [];
};
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "حدث خطأ غير متوقع";

export const getAdminStats = createServerFn({ method: "GET" }).middleware([requirePocketBaseAuth]).handler(async ({ context }) => {
  requireAdmin(context.role);
  const pb = await admin();
  const [users, courses, artisans, sessions] = await Promise.all([
    pb.collection("users").getFullList({ sort: "-created" }),
    pb.collection("courses").getList(1, 1),
    pb.collection("artisans").getList(1, 1),
    pb.collection("sessions").getList(1, 1),
  ]);
  const counts = { student: 0, artisan: 0, admin: 0 };
  users.forEach((user) => { if (user.role in counts) counts[user.role as keyof typeof counts]++; });
  return {
    totalUsers: users.length,
    students: counts.student,
    artisans: counts.artisan,
    admins: counts.admin,
    totalCourses: courses.totalItems,
    totalArtisans: artisans.totalItems,
    totalSessions: sessions.totalItems,
    recent: users.slice(0, 5).map((user) => ({ id: user.id, full_name: user.name, email: user.email, created_at: user.created })),
  };
});

export const listUsers = createServerFn({ method: "GET" }).middleware([requirePocketBaseAuth]).handler(async ({ context }) => {
  requireAdmin(context.role);
  const users = await (await admin()).collection("users").getFullList({ sort: "-created" });
  return users.map((user) => ({ id: user.id, full_name: user.name, email: user.email, avatar_url: user.avatar_url, created_at: user.created, roles: user.role ? [user.role] : [] }));
});

export const setUserRole = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).inputValidator((input: unknown) => z.object({ userId: recordId, role: roleSchema }).parse(input)).handler(async ({ context, data }) => {
  requireAdmin(context.role);
  await (await admin()).collection("users").update(data.userId, { role: data.role });
  return { ok: true };
});
export const deleteUser = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).inputValidator((input: unknown) => z.object({ userId: recordId }).parse(input)).handler(async ({ context, data }) => {
  requireAdmin(context.role);
  if (data.userId === context.userId) throw new Error("لا يمكنك حذف حسابك الخاص");
  await (await admin()).collection("users").delete(data.userId);
  return { ok: true };
});
export const checkIsAdmin = createServerFn({ method: "GET" }).middleware([requirePocketBaseAuth]).handler(async ({ context }) => ({ isAdmin: context.role === "admin" }));

const courseStatus = z.enum(["draft", "published"]);
const courseFieldsSchema = z.object({
  title: z.string().min(1).max(200), category: z.string().min(1).max(100), instructor: z.string().min(1).max(150),
  description: z.string().max(2000).optional().nullable(), students: z.number().int().min(0).default(0), status: courseStatus.default("draft"),
});
const formDataInput = (input: unknown): FormData => {
  if (!(input instanceof FormData)) throw new Error("بيانات الدورة غير صالحة");
  const fields = Object.fromEntries(["title", "category", "instructor", "description", "students", "status"].map((key) => [key, input.get(key)]));
  courseFieldsSchema.parse({
    ...fields,
    students: Number(fields.students ?? 0),
    description: fields.description || null,
  });
  return input;
};
type CourseRecord = RecordModel & {
  title: string;
  category: string;
  instructor: string;
  description?: string | null;
  students?: number;
  status: "draft" | "published";
  thumbnail?: string;
  thumbnail_url?: string | null;
  attachments?: string[];
};

type CourseResult = CourseRecord & {
  created_at: string;
  thumbnail_url: string | null;
  attachments: string[];
};

const courseResult = (record: CourseRecord): CourseResult => ({
  ...record,
  created_at: record.created,
  thumbnail_url: record.thumbnail_url ?? (record.thumbnail ? record.thumbnail : null),
  attachments: normalizeAttachments(record.attachments),
});

type PocketBaseCollection = {
  id: string;
  name: string;
  fields?: Array<{ name: string; type: string; collectionId?: string }>;
};

type CourseRelation = {
  collectionId: string;
  fieldName: string;
};

/**
 * Deletes records that reference a record before deleting that record itself.
 *
 * PocketBase only applies a relation field's `cascadeDelete` setting when it is
 * enabled in the collection schema.  Keeping this in the admin mutation makes
 * deletion reliable for existing deployments and for related collections added
 * later (lessons, assessments, subscriptions, etc.).
 */
const deleteRecordWithDependents = async (
  pb: Awaited<ReturnType<typeof admin>>,
  collections: PocketBaseCollection[],
  record: { collectionId: string; id: string },
  activeRecords = new Set<string>(),
): Promise<number> => {
  const recordKey = `${record.collectionId}:${record.id}`;
  if (activeRecords.has(recordKey)) {
    throw new Error("تعذر حذف الدورة بسبب علاقة دائرية بين السجلات المرتبطة بها.");
  }

  activeRecords.add(recordKey);
  try {
    const dependents: CourseRelation[] = collections.flatMap((collection) =>
      (collection.fields ?? [])
        .filter((field) => field.type === "relation" && field.collectionId === record.collectionId)
        .map((field) => ({ collectionId: collection.id, fieldName: field.name })),
    );

    let deletedCount = 0;
    for (const dependent of dependents) {
      // The relation-field name comes from the trusted PocketBase schema and
      // the record id is JSON encoded so it cannot alter the filter expression.
      const relatedRecords = await pb.collection(dependent.collectionId).getFullList({
        filter: `${dependent.fieldName} = ${JSON.stringify(record.id)}`,
        fields: "id",
      });

      for (const relatedRecord of relatedRecords) {
        deletedCount += await deleteRecordWithDependents(
          pb,
          collections,
          { collectionId: dependent.collectionId, id: relatedRecord.id },
          activeRecords,
        );
      }
    }

    await pb.collection(record.collectionId).delete(record.id);
    return deletedCount + 1;
  } finally {
    activeRecords.delete(recordKey);
  }
};

export const listCourses = createServerFn({ method: "GET" }).middleware([requirePocketBaseAuth]).handler(async ({ context }) => {
  requireAdmin(context.role);
  const pb = await admin();
  const records = await pb.collection("courses").getFullList({ sort: "-created" });
  return (records as CourseRecord[]).map((record) => ({
    ...courseResult(record),
    thumbnail_url: record.thumbnail ? pb.files.getURL(record, record.thumbnail) : record.thumbnail_url ?? null,
  }));
});
export const createCourse = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).inputValidator(formDataInput).handler(async ({ context, data }) => {
  requireAdmin(context.role); await (await admin()).collection("courses").create(data); return { ok: true };
});
export const updateCourse = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).inputValidator((input: unknown) => {
  const formData = formDataInput(input);
  const id = formData.get("id");
  recordId.parse(id);
  return formData;
}).handler(async ({ context, data }) => {
  requireAdmin(context.role);
  const id = recordId.parse(data.get("id"));
  await (await admin()).collection("courses").update(id, data);
  return { ok: true };
});
export const deleteCourse = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).inputValidator((input: unknown) => z.object({ id: recordId }).parse(input)).handler(async ({ context, data }) => {
  requireAdmin(context.role);
  const pb = await admin();

  try {
    const [, collections] = await Promise.all([
      pb.collection("courses").getOne(data.id, { fields: "id" }),
      pb.collections.getFullList(),
    ]);
    const courseCollection = (collections as PocketBaseCollection[]).find(
      (collection) => collection.name === "courses",
    );
    if (!courseCollection) {
      throw new Error("لم يتم العثور على مجموعة الدورات في PocketBase.");
    }

    const deletedRecords = await deleteRecordWithDependents(
      pb,
      collections as PocketBaseCollection[],
      // `RecordModel.collectionId` is not returned when the record query is
      // limited to `fields: "id"`; use the explicit schema collection id.
      { collectionId: courseCollection.id, id: data.id },
    );

    // Includes the course itself; expose only the number of removed dependents.
    return { ok: true, deletedDependents: Math.max(0, deletedRecords - 1) };
  } catch (error) {
    console.error("Failed to delete course and its related records", error);
    throw new Error("تعذر حذف الدورة وملحقاتها. تأكد من عدم وجود علاقات مطلوبة غير مهيأة للحذف المتسلسل ثم أعد المحاولة.");
  }
});

const artisanStatus = z.enum(["pending", "approved", "rejected"]);
const artisanSchema = z.object({ name: z.string().min(1).max(150), craft: z.string().min(1).max(100), bio: z.string().max(2000).optional().nullable(), rating: z.number().min(0).max(5).default(0), sessions_count: z.number().int().min(0).default(0), status: artisanStatus.default("pending") });
export const listArtisans = createServerFn({ method: "GET" }).middleware([requirePocketBaseAuth]).handler(async ({ context }) => { requireAdmin(context.role); return (await (await admin()).collection("artisans").getFullList({ sort: "-created" })).map((record) => ({ ...record, created_at: record.created })); });
export const createArtisan = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).inputValidator((input: unknown) => artisanSchema.parse(input)).handler(async ({ context, data }) => { requireAdmin(context.role); await (await admin()).collection("artisans").create(data); return { ok: true }; });
export const updateArtisan = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).inputValidator((input: unknown) => z.object({ id: recordId, patch: artisanSchema.partial() }).parse(input)).handler(async ({ context, data }) => { requireAdmin(context.role); await (await admin()).collection("artisans").update(data.id, data.patch); return { ok: true }; });
export const setArtisanStatus = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).inputValidator((input: unknown) => z.object({ id: recordId, status: artisanStatus }).parse(input)).handler(async ({ context, data }) => { requireAdmin(context.role); await (await admin()).collection("artisans").update(data.id, { status: data.status }); return { ok: true }; });
export const deleteArtisan = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).inputValidator((input: unknown) => z.object({ id: recordId }).parse(input)).handler(async ({ context, data }) => { requireAdmin(context.role); await (await admin()).collection("artisans").delete(data.id); return { ok: true }; });

const sessionStatus = z.enum(["upcoming", "completed", "cancelled"]);
const sessionSchema = z.object({ artisan_name: z.string().min(1).max(150), student_name: z.string().min(1).max(150), craft: z.string().min(1).max(100), scheduled_at: z.string().min(1), status: sessionStatus.default("upcoming") });
export const listSessions = createServerFn({ method: "GET" }).middleware([requirePocketBaseAuth]).handler(async ({ context }) => { requireAdmin(context.role); return (await (await admin()).collection("sessions").getFullList({ sort: "-scheduled_at" })).map((record) => ({ ...record, created_at: record.created })); });
export const createSession = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).inputValidator((input: unknown) => sessionSchema.parse(input)).handler(async ({ context, data }) => { requireAdmin(context.role); await (await admin()).collection("sessions").create(data); return { ok: true }; });
export const setSessionStatus = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).inputValidator((input: unknown) => z.object({ id: recordId, status: sessionStatus }).parse(input)).handler(async ({ context, data }) => { requireAdmin(context.role); await (await admin()).collection("sessions").update(data.id, { status: data.status }); return { ok: true }; });
export const deleteSession = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).inputValidator((input: unknown) => z.object({ id: recordId }).parse(input)).handler(async ({ context, data }) => { requireAdmin(context.role); await (await admin()).collection("sessions").delete(data.id); return { ok: true }; });
