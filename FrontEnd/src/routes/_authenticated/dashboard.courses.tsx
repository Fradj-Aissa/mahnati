import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Play, Clock, BookOpen, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrolledCourses } from "@/hooks/use-dashboard";
import { pb } from "@/integrations/pocketbase/client";
import type { EnrolledCourse } from "@/lib/dashboard-data";

const fallbackCourseImage = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&q=80";

export const Route = createFileRoute("/_authenticated/dashboard/courses")({
  component: MyCoursesPage,
  head: () => ({ meta: [{ title: "دوراتي — مهنتي" }] }),
});

type Filter = "all" | "in_progress" | "completed" | "saved";

function MyCoursesPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const { data: enrollments = [], isLoading } = useEnrolledCourses();
  const enrolledCourses: EnrolledCourse[] = enrollments.flatMap((enrollment) => {
    const course = enrollment.expand?.course as {
      id: string;
      title?: string;
      category?: string;
      thumbnail?: string;
      thumbnail_url?: string;
    } | undefined;
    if (!course) return [];
    return [{
      id: course.id,
      title: course.title ?? "دورة بدون عنوان",
      category: course.category ?? "أخرى",
      thumbnail: course.thumbnail_url || (course.thumbnail ? pb.files.getURL(course, course.thumbnail) : fallbackCourseImage),
      progress: enrollment.progress ?? 0,
      lastActivity: enrollment.updated ? new Date(enrollment.updated).toLocaleDateString("ar-DZ") : "",
      status: enrollment.status,
    }];
  });

  const filtered = enrolledCourses.filter((c) => {
    const matchQ = c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase());
    const matchF = filter === "all" ? true : c.status === filter;
    return matchQ && matchF;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في دوراتك..."
            className="pr-9"
          />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="in_progress">قيد التقدم</TabsTrigger>
            <TabsTrigger value="completed">مكتملة</TabsTrigger>
            <TabsTrigger value="saved">المحفوظة</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">جارٍ تحميل دوراتك...</div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course, i) => (
            <CourseCard key={course.id} course={course} delay={i * 0.05} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, delay }: { course: EnrolledCourse; delay: number }) {
  const statusBadge = {
    in_progress: { label: "قيد التقدم", cls: "bg-primary/10 text-primary border-primary/20" },
    completed: { label: "مكتملة", cls: "bg-success/10 text-success border-success/20" },
    saved: { label: "محفوظة", cls: "bg-muted text-muted-foreground" },
  }[course.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative h-40 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted" aria-label="لا توجد صورة للدورة">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <Badge className={`absolute right-3 top-3 border ${statusBadge.cls}`} variant="outline">
          {statusBadge.label}
        </Badge>
      </div>
      <div className="p-5">
        <p className="text-xs text-muted-foreground">{course.category}</p>
        <h3 className="mt-1 line-clamp-2 text-base font-bold text-foreground">{course.title}</h3>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> {course.lastActivity}
        </div>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">التقدم</span>
            <span className="font-semibold text-foreground">{course.progress}%</span>
          </div>
          <Progress value={course.progress} />
        </div>
        <Button className="mt-4 w-full gradient-accent border-0 text-primary-foreground">
          <Play className="h-4 w-4" />
          {course.status === "completed" ? "مراجعة" : course.status === "saved" ? "ابدأ الآن" : "أكمل التعلم"}
        </Button>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-bold text-foreground">لا توجد دورات</h3>
      <p className="mt-1 text-sm text-muted-foreground">جرّب تغيير البحث أو الفلتر</p>
    </div>
  );
}
