import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Users, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePublishedCourses } from "@/hooks/use-courses";
import { CourseCardSkeleton } from "@/components/skeletons/HomePageSkeleton";

export function FeaturedCourses() {
  const { data: courses = [], isLoading } = usePublishedCourses();
  const featured = courses.slice(0, 3);

  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              دورات مميزة
            </h2>
            <p className="mt-2 text-muted-foreground">الأكثر طلباً من طلابنا</p>
          </div>
          <Button asChild variant="outline" className="hidden sm:flex">
            <Link to="/courses">عرض الكل</Link>
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)}

          {!isLoading &&
            featured.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link
                  to="/courses/$courseId"
                  params={{ courseId: course.id }}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
                >
                  {/* Color bar */}
                  <div className="h-2 gradient-hero" />

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {course.description}
                    </p>

                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {course.students} طالب
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <span className="text-sm text-muted-foreground">{course.instructor}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
        </div>

        {!isLoading && featured.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">لا توجد دورات منشورة بعد — ترقب جديدنا قريباً!</p>
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link to="/courses">عرض جميع الدورات</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
