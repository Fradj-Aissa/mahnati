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
const courseSchema = z.object({
  title: z.string().min(1).max(200), category: z.string().min(1).max(100), instructor: z.string().min(1).max(150),
  description: z.string().max(2000).optional().nullable(), students: z.number().int().min(0).default(0), status: courseStatus.default("draft"),
  thumbnail_url: z.string().optional().nullable(), attachments: z.array(z.string()).default([]),
  attachmentFiles: z.array(z.object({ name: z.string(), type: z.string(), data: z.string() })).default([]),
});
const courseData = (data: z.infer<typeof courseSchema>) => {
  const { thumbnail_url: _thumbnailUrl, attachments: _attachments, attachmentFiles, ...fields } = data;
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, String(value));
  });
  attachmentFiles.forEach((file) => {
    const [, base64] = file.data.split(",");
    if (base64) {
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      formData.append("attachments", new Blob([bytes], { type: file.type }), file.name);
    }
  });
  return formData;
};
type CourseRecord = RecordModel & {
  title: string;
  category: string;
  instructor: string;
  description?: string | null;
  students?: number;
  status: "draft" | "published";
  thumbnail?: string;
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
  thumbnail_url: record.thumbnail ? record.thumbnail : null,
  attachments: normalizeAttachments(record.attachments),
});

export const listCourses = createServerFn({ method: "GET" }).middleware([requirePocketBaseAuth]).handler(async ({ context }) => {
  requireAdmin(context.role);
  const records = await (await admin()).collection("courses").getFullList({ sort: "-created" });
  return (records as CourseRecord[]).map(courseResult);
});
export const createCourse = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).inputValidator((input: unknown) => courseSchema.parse(input)).handler(async ({ context, data }) => {
  requireAdmin(context.role); await (await admin()).collection("courses").create(courseData(data)); return { ok: true };
});
export const updateCourse = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).inputValidator((input: unknown) => z.object({ id: recordId, patch: courseSchema.partial() }).parse(input)).handler(async ({ context, data }) => {
  requireAdmin(context.role); await (await admin()).collection("courses").update(data.id, courseData({ ...data.patch, attachmentFiles: data.patch.attachmentFiles ?? [], attachments: data.patch.attachments ?? [] } as z.infer<typeof courseSchema>)); return { ok: true };
});
export const deleteCourse = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).inputValidator((input: unknown) => z.object({ id: recordId }).parse(input)).handler(async ({ context, data }) => {
  requireAdmin(context.role); await (await admin()).collection("courses").delete(data.id); return { ok: true };
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
