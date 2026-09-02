import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DBCourse {
  id: string;
  title: string;
  category: string;
  description: string | null;
  instructor: string;
  students: number;
  status: "draft" | "published";
  created_at: string;
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

async function fetchPublishedCourses(): Promise<DBCourse[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, category, description, instructor, students, status, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DBCourse[];
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
      const { data, error } = await supabase
        .from("courses")
        .select("category")
        .eq("status", "published");

      if (error) throw error;

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
      const [coursesResult, profilesResult, artisansResult, sessionsResult] = await Promise.all([
        supabase.from("courses").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("artisans").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("sessions").select("id", { count: "exact", head: true }),
      ]);

      if (coursesResult.error) throw coursesResult.error;
      if (profilesResult.error) throw profilesResult.error;
      if (artisansResult.error) throw artisansResult.error;
      if (sessionsResult.error) throw sessionsResult.error;

      return {
        students: profilesResult.count ?? 0,
        courses: coursesResult.count ?? 0,
        artisans: artisansResult.count ?? 0,
        sessions: sessionsResult.count ?? 0,
      };
    },
  });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ["courses", courseId],
    queryFn: async (): Promise<DBCourse | null> => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, category, description, instructor, students, status, created_at")
        .eq("id", courseId)
        .maybeSingle();
      if (error) throw error;
      return (data as DBCourse | null) ?? null;
    },
  });
}
