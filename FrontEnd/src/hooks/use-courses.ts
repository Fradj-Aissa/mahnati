import { useQuery } from "@tanstack/react-query";
import { pb } from "@/integrations/pocketbase/client";

export interface DBCourse {
  id: string;
  title: string;
  category: string;
  description: string | null;
  instructor: string;
  students: number;
  status: "draft" | "published";
  created_at: string;
  attachments: string[];
}

export interface HomepageCategory {
  id: string;
  title: string;
  description: string;
  color: string;
  imageKey: "speaking" | "languages" | "plumbing" | "sewing" | "default";
  courseCount: number;
}

const categoryMeta: Record<string, Pick<HomepageCategory, "description" | "color" | "imageKey">> = {
  "فن الخطابة": {
    description: "تعلم مهارات التحدث أمام الجمهور والإقناع والتأثير",
    color: "bg-primary/10",
    imageKey: "speaking",
  },
  "اللغات": {
    description: "تعلم اللغات الأجنبية بأسلوب تفاعلي وعملي",
    color: "bg-accent/10",
    imageKey: "languages",
  },
  "السباكة": {
    description: "إتقان أساسيات ومتقدمات مهنة السباكة",
    color: "bg-success/10",
    imageKey: "plumbing",
  },
  "الخياطة": {
    description: "تعلم فنون الخياطة من البداية إلى الاحتراف",
    color: "bg-warning/10",
    imageKey: "sewing",
  },
  "الخياطة والتفصيل": {
    description: "تعلم فنون الخياطة من البداية إلى الاحتراف",
    color: "bg-warning/10",
    imageKey: "sewing",
  },
  "أخرى": {
    description: "استكشف مسارات تعليمية متنوعة تناسب طموحك المهني",
    color: "bg-muted/50",
    imageKey: "default",
  },
};

function normalizeCategoryTitle(rawCategory: string): string {
  const value = rawCategory.trim();
  if (!value) return "أخرى";

  const lower = value.toLowerCase();

  if (lower.includes("خطاب") || lower.includes("تواصل") || lower.includes("public") || lower.includes("speaking")) return "فن الخطابة";
  if (lower.includes("لغة") || lower.includes("english") || lower.includes("arabic") || lower.includes("french") || lower.includes("spanish")) return "اللغات";
  if (lower.includes("سباك") || lower.includes("plumbing") || lower.includes("pipe")) return "السباكة";
  if (lower.includes("خياطة") || lower.includes("تفصيل") || lower.includes("sewing") || lower.includes("tailoring")) return "الخياطة والتفصيل";

  return "أخرى";
}

function normalizeAttachments(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((file): file is string => typeof file === "string");
  return typeof value === "string" && value ? [value] : [];
}

async function fetchPublishedCourses(): Promise<DBCourse[]> {
  const records = await pb.collection("courses").getFullList({
    filter: 'status = "published"',
    sort: "-created",
  });
  return records.map((record) => ({
    id: record.id,
    title: record.title,
    category: record.category,
    description: record.description ?? null,
    instructor: record.instructor,
    students: Number(record.students ?? 0),
    status: record.status,
    created_at: record.created,
    attachments: normalizeAttachments(record.attachments).map((file) => pb.files.getURL(record, file)),
  } as DBCourse));
}

export function usePublishedCourses() {
  return useQuery({
    queryKey: ["courses", "published"],
    queryFn: fetchPublishedCourses,
  });
}

export function useHomepageCategories() {
  return useQuery({
    queryKey: ["homepage", "categories"],
    queryFn: async (): Promise<HomepageCategory[]> => {
      const data = await pb.collection("courses").getFullList({
        filter: 'status = "published"',
        fields: "category",
      });

      const categoryMap = new Map<string, HomepageCategory>();

      for (const row of data ?? []) {
        const title = normalizeCategoryTitle(String(row.category ?? ""));
        const meta = categoryMeta[title] ?? categoryMeta["أخرى"];
        const current = categoryMap.get(title) ?? {
          id: title,
          title,
          description: meta.description,
          color: meta.color,
          imageKey: meta.imageKey,
          courseCount: 0,
        };

        current.courseCount += 1;
        categoryMap.set(title, current);
      }

      return Array.from(categoryMap.values()).sort((a, b) => b.courseCount - a.courseCount);
    },
  });
}

export interface HomepageStats {
  students: number;
  courses: number;
  artisans: number;
  sessions: number;
}

export function useHomepageStats() {
  return useQuery({
    queryKey: ["homepage", "stats"],
    queryFn: async (): Promise<HomepageStats> => {
      const [coursesResult, usersResult, artisansResult, sessionsResult] = await Promise.all([
        pb.collection("courses").getList(1, 1, { filter: 'status = "published"' }),
        pb.collection("users").getList(1, 1),
        pb.collection("artisans").getList(1, 1, { filter: 'status = "approved"' }),
        pb.collection("sessions").getList(1, 1),
      ]);

      return {
        students: usersResult.totalItems,
        courses: coursesResult.totalItems,
        artisans: artisansResult.totalItems,
        sessions: sessionsResult.totalItems,
      };
    },
  });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ["courses", courseId],
    queryFn: async (): Promise<DBCourse | null> => {
      try {
        const record = await pb.collection("courses").getOne(courseId);
        return {
          id: record.id,
          title: record.title,
          category: record.category,
          description: record.description ?? null,
          instructor: record.instructor,
          students: Number(record.students ?? 0),
          status: record.status,
          created_at: record.created,
          attachments: normalizeAttachments(record.attachments).map((file) => pb.files.getURL(record, file)),
        } as DBCourse;
      } catch (error) {
        if (error && typeof error === "object" && "status" in error && error.status === 404) return null;
        throw error;
      }
    },
  });
}
