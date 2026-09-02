import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Video, MessagesSquare, Play, ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { dashboardStats, enrolledCourses, sessions } from "@/lib/dashboard-data";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardOverview,
  head: () => ({ meta: [{ title: "لوحة التحكم — مهنتي" }] }),
});

function DashboardOverview() {
  const { user } = useAuth();
  const fullName = user?.user_metadata?.full_name || "مستخدم مهنتي";
  const email = user?.email || "";
  const continueCourse = enrolledCourses.find((c) => c.status === "in_progress");
  const upcoming = sessions.filter((s) => s.status === "upcoming").slice(0, 2);

  const initials = fullName.split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl gradient-hero p-6 text-primary-foreground shadow-hero sm:p-8"
      >
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white/30 sm:h-20 sm:w-20">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-white/20 text-xl text-white">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-primary-foreground/70">أهلاً بعودتك 👋</p>
              <h2 className="text-2xl font-bold sm:text-3xl">{fullName}</h2>
              <p className="text-sm text-primary-foreground/80">{email}</p>
              <Badge className="mt-2 border-0 bg-white/15 text-white hover:bg-white/25">
                <Sparkles className="ml-1 h-3 w-3" /> مهتم بـ فن الخطابة
              </Badge>
            </div>
          </div>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link to="/dashboard/courses">استكشف دوراتي</Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="الدورات المسجلة" value={dashboardStats.enrolledCourses} icon={BookOpen} tone="primary" delay={0.05} />
        <StatCard label="الدروس المكتملة" value={dashboardStats.completedLessons} icon={CheckCircle2} tone="success" delay={0.1} />
        <StatCard label="جلسات الحرفيين" value={dashboardStats.artisanSessions} icon={Video} tone="accent" delay={0.15} />
        <StatCard label="منشورات المجتمع" value={dashboardStats.communityPosts} icon={MessagesSquare} tone="warning" delay={0.2} />
      </div>

      {/* Continue learning + Upcoming sessions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {continueCourse && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-2 overflow-hidden rounded-2xl border border-border bg-card shadow-card"
          >
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr]">
              <div className="relative h-40 sm:h-full">
                <img src={continueCourse.thumbnail} alt={continueCourse.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <p className="text-xs text-muted-foreground">أكمل تعلمك</p>
                <h3 className="mt-1 text-lg font-bold text-foreground">{continueCourse.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{continueCourse.category} · {continueCourse.lastActivity}</p>
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{continueCourse.progress}% مكتمل</span>
                  </div>
                  <Progress value={continueCourse.progress} />
                </div>
                <Button asChild className="mt-4 gradient-accent border-0 text-primary-foreground">
                  <Link to="/dashboard/courses">
                    <Play className="h-4 w-4" /> أكمل التعلم
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-card"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">جلساتك القادمة</h3>
            <Link to="/dashboard/sessions" className="text-xs text-primary hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground">لا توجد جلسات قادمة</p>
            )}
            {upcoming.map((s) => (
              <div key={s.id} className="rounded-xl border border-border/60 bg-muted/40 p-3">
                <p className="text-sm font-semibold text-foreground">{s.artisan}</p>
                <p className="text-xs text-muted-foreground">{s.specialty}</p>
                <p className="mt-1 text-xs text-primary">{s.date} · {s.time}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
