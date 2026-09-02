import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, BookOpen, Play, FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sampleLessons } from "@/lib/data";
import { useCourse } from "@/hooks/use-courses";
import { CourseDetailSkeleton } from "@/components/skeletons/CourseDetailSkeleton";
import { useAuth } from "@/hooks/use-auth";
import { useEnrollInCourse, useEnrollment } from "@/hooks/use-dashboard";
import { toast } from "sonner";

export const Route = createFileRoute("/courses/$courseId")({
  pendingComponent: CourseDetailSkeleton,
  head: () => ({
    meta: [
      { title: "تفاصيل الدورة — مهنتي" },
      { name: "description", content: "اكتشف تفاصيل الدورة ومحتواها على منصة مهنتي" },
      { property: "og:title", content: "تفاصيل الدورة — مهنتي" },
      { property: "og:description", content: "اكتشف تفاصيل الدورة ومحتواها على منصة مهنتي" },
    ],
  }),
  component: CourseDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">الدورة غير موجودة</h1>
        <Link to="/courses" className="mt-4 text-primary hover:underline">العودة للدورات</Link>
      </div>
    </div>
  ),
});

function CourseDetailPage() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: course, isLoading } = useCourse(courseId);
  const { data: enrollment, isLoading: enrollmentLoading } = useEnrollment(courseId);
  const enroll = useEnrollInCourse();

  const handleEnroll = async () => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (enrollment) {
      navigate({ to: "/dashboard/courses" });
      return;
    }
    try {
      await enroll.mutateAsync(courseId);
      toast.success("تم التسجيل في الدورة بنجاح");
      navigate({ to: "/dashboard/courses" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر التسجيل في الدورة");
    }
  };

  if (isLoading) return <CourseDetailSkeleton />;

  if (!course) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">الدورة غير موجودة</h1>
          <Link to="/courses" className="mt-4 inline-block text-primary hover:underline">العودة للدورات</Link>
        </div>
      </div>
    );
  }

  const lessons = sampleLessons.filter((l) => l.courseId === courseId);
  const completedCount = lessons.filter((l) => l.completed).length;
  const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to="/courses" className="mb-4 inline-flex items-center gap-1 text-sm text-primary-foreground/70 hover:text-primary-foreground">
              <ArrowRight className="h-4 w-4" />
              العودة للدورات
            </Link>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">{course.category}</Badge>
                </div>
                <h1 className="mt-4 text-3xl font-bold text-primary-foreground sm:text-4xl">
                  {course.title}
                </h1>
                <p className="mt-4 text-lg leading-relaxed text-primary-foreground/80">
                  {course.description}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-primary-foreground/70">
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.students} طالب</span>
                </div>

                <p className="mt-3 text-sm text-primary-foreground/60">المدرب: {course.instructor}</p>
              </div>

              {/* Enroll Card */}
              <div className="w-full rounded-2xl border border-primary-foreground/10 bg-primary-foreground/10 p-6 backdrop-blur-sm lg:w-80">
                <div className="text-center">
                  <span className="text-3xl font-bold text-primary-foreground">مجاني</span>
                  {enrollment && lessons.length > 0 ? (
                    <Button asChild size="lg" className="mt-4 w-full gradient-accent border-0 text-primary-foreground">
                      <Link
                        to="/learn/$courseId/$lessonId"
                        params={{ courseId: course.id, lessonId: lessons[0].id }}
                      >
                        ابدأ التعلم
                      </Link>
                    </Button>
                  ) : (
                    <Button size="lg" onClick={handleEnroll} disabled={enroll.isPending || enrollmentLoading} className="mt-4 w-full gradient-accent border-0 text-primary-foreground">
                      {enroll.isPending ? "جارٍ التسجيل..." : enrollment ? "الذهاب إلى دوراتي" : "سجل الآن"}
                    </Button>
                  )}
                  <p className="mt-3 text-xs text-primary-foreground/60">وصول مدى الحياة • شهادة إتمام</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Lessons */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-foreground">محتوى الدورة</h2>
            {progress > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">تقدمك</span>
                  <span className="font-medium text-primary">{progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              {lessons.map((lesson, i) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                    lesson.completed
                      ? "border-success/30 bg-success/5"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    lesson.completed ? "bg-success/20" : "bg-muted"
                  }`}>
                    {lesson.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : lesson.type === "video" ? (
                      <Play className="h-5 w-5 text-primary" />
                    ) : (
                      <FileText className="h-5 w-5 text-accent" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{lesson.title}</h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{lesson.type === "video" ? "فيديو" : "PDF"}</span>
                      <span>{lesson.duration}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {lesson.order}
                  </Badge>
                </motion.div>
              ))}

              {lessons.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">سيتم إضافة الدروس قريباً</p>
              )}

              {course.attachments.length > 0 && (
                <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-card">
                  <h3 className="font-semibold text-foreground">ملفات الدورة</h3>
                  <div className="mt-3 space-y-2">
                    {course.attachments.map((file, index) => (
                      <a
                        key={file}
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-border/60 p-3 text-sm text-primary hover:bg-muted"
                      >
                        <FileText className="h-4 w-4" />
                        تحميل ملف PDF {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground">ما ستتعلمه</h3>
              <ul className="mt-4 space-y-3">
                {["أساسيات المجال النظرية", "تطبيقات عملية حقيقية", "مشاريع تطبيقية", "شهادة إتمام معتمدة"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground">التصنيف</h3>
              <Badge variant="outline" className="mt-2">{course.category}</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
