import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2, Play, FileText, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { courses, sampleLessons } from "@/lib/data";

export const Route = createFileRoute("/learn/$courseId/$lessonId")({
  head: ({ params }) => {
    const lesson = sampleLessons.find((l) => l.id === params.lessonId);
    const course = courses.find((c) => c.id === params.courseId);
    const title = lesson ? `${lesson.title} — ${course?.title ?? "مهنتي"}` : "التعلم — مهنتي";
    return {
      meta: [
        { title },
        { name: "description", content: `تعلم: ${lesson?.title ?? ""}` },
      ],
    };
  },
  component: LearnPage,
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">الدرس غير موجود</h1>
        <Link to="/courses" className="mt-4 text-primary hover:underline">العودة للدورات</Link>
      </div>
    </div>
  ),
});

function LearnPage() {
  const { courseId, lessonId } = Route.useParams();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === courseId);
  const lessons = sampleLessons.filter((l) => l.courseId === courseId);
  const currentLesson = lessons.find((l) => l.id === lessonId);
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);

  if (!course || !currentLesson) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">الدرس غير موجود</h1>
          <Link to="/courses" className="mt-4 inline-block text-primary hover:underline">العودة للدورات</Link>
        </div>
      </div>
    );
  }

  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const completedCount = lessons.filter((l) => l.completed).length;
  const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/courses/$courseId"
              params={{ courseId }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
              {course.title}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} / {lessons.length}
            </span>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-primary">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={lessonId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Video / PDF */}
              {currentLesson.type === "video" ? (
                <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                  <iframe
                    src={currentLesson.contentUrl}
                    title={currentLesson.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                  <div className="text-center">
                    <FileText className="mx-auto h-16 w-16 text-accent" />
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{currentLesson.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">ملف PDF — {currentLesson.duration}</p>
                    <Button className="mt-4 gradient-accent border-0 text-primary-foreground">
                      تحميل الملف
                    </Button>
                  </div>
                </div>
              )}

              {/* Lesson Info */}
              <div className="mt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{currentLesson.title}</h1>
                    <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="outline">
                        {currentLesson.type === "video" ? "فيديو" : "PDF"}
                      </Badge>
                      <span>{currentLesson.duration}</span>
                      <span>الدرس {currentLesson.order}</span>
                    </div>
                  </div>
                  {currentLesson.completed && (
                    <Badge className="gap-1 bg-success/20 text-success hover:bg-success/20">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      مكتمل
                    </Badge>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between">
                {prevLesson ? (
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate({
                        to: "/learn/$courseId/$lessonId",
                        params: { courseId, lessonId: prevLesson.id },
                      })
                    }
                  >
                    <ArrowRight className="h-4 w-4" />
                    السابق
                  </Button>
                ) : (
                  <div />
                )}
                {nextLesson ? (
                  <Button
                    onClick={() =>
                      navigate({
                        to: "/learn/$courseId/$lessonId",
                        params: { courseId, lessonId: nextLesson.id },
                      })
                    }
                  >
                    التالي
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="gradient-accent border-0 text-primary-foreground">
                    🎉 أكمل الدورة
                  </Button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Lesson List */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-border bg-card shadow-card">
              <div className="border-b border-border p-4">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <BookOpen className="h-4 w-4" />
                  قائمة الدروس
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {completedCount} من {lessons.length} مكتمل
                </p>
              </div>
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-1 p-2">
                  {lessons.map((lesson) => {
                    const isActive = lesson.id === lessonId;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() =>
                          navigate({
                            to: "/learn/$courseId/$lessonId",
                            params: { courseId, lessonId: lesson.id },
                          })
                        }
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs ${
                          lesson.completed
                            ? "bg-success/20"
                            : isActive
                              ? "bg-primary/20"
                              : "bg-muted"
                        }`}>
                          {lesson.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : lesson.type === "video" ? (
                            <Play className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`truncate text-sm font-medium ${isActive ? "text-primary" : ""}`}>
                            {lesson.title}
                          </p>
                          <p className="text-xs opacity-70">{lesson.duration}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
