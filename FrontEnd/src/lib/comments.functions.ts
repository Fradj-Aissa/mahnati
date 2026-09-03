import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requirePocketBaseAuth } from "@/integrations/pocketbase/auth-middleware";
import { getPbAdmin } from "@/integrations/pocketbase/client.server";

const targetSchema = z.object({ targetId: z.string().min(1), targetType: z.enum(["course", "artisan"]) });
const commentSchema = targetSchema.extend({ content: z.string().trim().min(2).max(1000), rating: z.number().int().min(1).max(5) });
const reportSchema = z.object({ commentId: z.string().min(1), reason: z.enum(["inappropriate", "spam", "hate", "other"]), details: z.string().trim().max(500).optional() });

export type Comment = {
  id: string; userId: string; userName: string; avatarUrl: string | null; content: string; rating: number; created: string;
};

const escapeFilterValue = (value: string) => JSON.stringify(value);

export const getComments = createServerFn({ method: "GET" }).validator(targetSchema).handler(async ({ data }): Promise<Comment[]> => {
  const pb = await getPbAdmin();
  const records = await pb.collection("comments").getFullList({
    filter: `target_type = ${escapeFilterValue(data.targetType)} && target_id = ${escapeFilterValue(data.targetId)}`,
    expand: "user",
    sort: "-created",
  });
  return records.map((record) => {
    const user = record.expand?.user as { id?: string; name?: string; email?: string; avatar_url?: string } | undefined;
    return { id: record.id, userId: String(record.user), userName: user?.name || user?.email || "مستخدم مهنتي", avatarUrl: user?.avatar_url ?? null, content: String(record.content), rating: Number(record.rating), created: record.created };
  });
});

export const addComment = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).validator(commentSchema).handler(async ({ context, data }) => {
  if (!context.userId) throw new Error("يرجى تسجيل الدخول لإضافة تعليق.");
  const record = await (await getPbAdmin()).collection("comments").create({ user: context.userId, target_type: data.targetType, target_id: data.targetId, content: data.content, rating: data.rating });
  return { id: record.id };
});

export const deleteComment = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).validator(z.object({ id: z.string().min(1) })).handler(async ({ context, data }) => {
  const pb = await getPbAdmin();
  const comment = await pb.collection("comments").getOne(data.id, { fields: "id,user" });
  if (comment.user !== context.userId && context.role !== "admin") throw new Error("لا تملك صلاحية حذف هذا التعليق.");
  await pb.collection("comments").delete(data.id);
  return { ok: true };
});

export const reportComment = createServerFn({ method: "POST" }).middleware([requirePocketBaseAuth]).validator(reportSchema).handler(async ({ context, data }) => {
  if (!context.userId) throw new Error("يرجى تسجيل الدخول لإرسال بلاغ.");
  const pb = await getPbAdmin();
  const comment = await pb.collection("comments").getOne(data.commentId, { fields: "id,user" });
  if (comment.user === context.userId) throw new Error("لا يمكنك الإبلاغ عن تعليقك.");
  const existing = await pb.collection("reports").getList(1, 1, { filter: `user = ${escapeFilterValue(context.userId)} && comment = ${escapeFilterValue(data.commentId)}` });
  if (existing.totalItems > 0) throw new Error("لقد أرسلت بلاغاً لهذا التعليق مسبقاً.");
  await pb.collection("reports").create({ comment: data.commentId, user: context.userId, reason: data.reason, details: data.details || "" });
  return { ok: true };
});
