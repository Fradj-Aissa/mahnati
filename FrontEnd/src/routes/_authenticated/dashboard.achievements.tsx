import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Trophy, Flame, Star, Users, GraduationCap, Zap, Lock } from "lucide-react";
import { achievements } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard/achievements")({
  component: AchievementsPage,
  head: () => ({ meta: [{ title: "الإنجازات — مهنتي" }] }),
});

const iconMap = { trophy: Trophy, flame: Flame, star: Star, users: Users, graduation: GraduationCap, zap: Zap };
const colorMap: Record<string, string> = {
  primary: "from-primary/20 to-primary/5 text-primary",
  accent: "from-accent/25 to-accent/5 text-accent-foreground",
  success: "from-success/20 to-success/5 text-success",
  warning: "from-warning/25 to-warning/5 text-warning-foreground",
};

function AchievementsPage() {
  const earned = achievements.filter((a) => a.earned).length;
  const total = achievements.length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <p className="text-sm text-muted-foreground">إجمالي الإنجازات</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">{earned}</span>
          <span className="text-lg text-muted-foreground">/ {total}</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full gradient-accent transition-all"
            style={{ width: `${(earned / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a, i) => {
          const Icon = iconMap[a.icon];
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover",
                !a.earned && "opacity-60"
              )}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br", colorMap[a.color])} />
              <div className="relative">
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl bg-card shadow-card",
                  colorMap[a.color]
                )}>
                  {a.earned ? <Icon className="h-7 w-7" /> : <Lock className="h-6 w-6 text-muted-foreground" />}
                </div>
                <h3 className="mt-4 font-bold text-foreground">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                {a.earned && a.earnedAt && (
                  <p className="mt-3 text-xs text-muted-foreground">حصلت عليه: {a.earnedAt}</p>
                )}
                {!a.earned && (
                  <p className="mt-3 text-xs font-medium text-muted-foreground">لم تفتحه بعد</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
