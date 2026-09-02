import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Play, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublishedCourses } from "@/hooks/use-courses";

export function ContinueLearning() {
  const { data: courses = [], isLoading, error } = usePublishedCourses();

  if (isLoading) {
    return (
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-[120px] animate-pulse rounded-2xl border border-border bg-muted/40" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            تعذر تحميل مسار التعلم الحالي. حاول مرة أخرى لاحقاً.
          </div>
        </div>
      </section>
    );
  }

  const course = courses[0];
  if (!course) return null;

  const progress = 0;

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
        >
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">أكمل تعلمك</p>
                <h3 className="text-lg font-bold text-foreground">{course.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">ابدأ الآن في رحلتك التعليمية</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-left">
                <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{progress}% مكتمل</p>
              </div>
              <Button asChild className="gradient-accent border-0 text-primary-foreground">
                <Link to="/courses/$courseId" params={{ courseId: course.id }}>
                  أكمل التعلم
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
