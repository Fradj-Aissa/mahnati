import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Users, Search, Filter, BookOpen, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePublishedCourses } from "@/hooks/use-courses";
import { CoursesPageSkeleton } from "@/components/skeletons/CoursesPageSkeleton";
import { CourseCardSkeleton } from "@/components/skeletons/HomePageSkeleton";

export const Route = createFileRoute("/courses/")({
  pendingComponent: CoursesPageSkeleton,
  head: () => ({
    meta: [
      { title: "التخصصات والدورات — مهنتي" },
      { name: "description", content: "تصفح جميع التخصصات والدورات المتاحة على منصة مهنتي" },
      { property: "og:title", content: "التخصصات والدورات — مهنتي" },
      { property: "og:description", content: "تصفح جميع التخصصات والدورات المتاحة على منصة مهنتي" },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: courses = [], isLoading } = usePublishedCourses();

  const categories = Array.from(new Set(courses.map((c) => c.category)));

  const filtered = courses.filter((c) => {
    const matchCategory = !selectedCategory || c.category === selectedCategory;
    const matchSearch = !searchQuery || c.title.includes(searchQuery) || (c.description ?? "").includes(searchQuery);
    return matchCategory && matchSearch;
  });

  if (isLoading) return <CoursesPageSkeleton />;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="gradient-hero py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
            جميع الدورات والتخصصات
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
            اختر من بين مجموعة متنوعة من الدورات المهنية والتطبيقية
          </p>

          <div className="mx-auto mt-8 max-w-xl">
            <div className="flex items-center gap-2 rounded-2xl bg-primary-foreground/95 p-2 backdrop-blur-sm">
              <Search className="mr-3 h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="ابحث عن دورة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters + Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Category filters */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            الكل
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        <p className="mb-6 text-sm text-muted-foreground">{filtered.length} دورة متاحة</p>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link
                to="/courses/$courseId"
                params={{ courseId: course.id }}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
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
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.students} طالب</span>
                    {course.ratingsCount > 0 && (
                      <span className="flex items-center gap-1 text-warning font-medium">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        {course.averageRating.toFixed(1)}
                        <span className="text-muted-foreground font-normal">({course.ratingsCount})</span>
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-sm text-muted-foreground">{course.instructor}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {courses.length === 0
                ? "لا توجد دورات منشورة بعد — ترقب جديدنا قريباً!"
                : "لا توجد دورات تطابق بحثك. جرب كلمات أخرى."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
