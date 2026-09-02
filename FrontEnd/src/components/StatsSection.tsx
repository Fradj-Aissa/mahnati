import { motion } from "framer-motion";
import { Users, BookOpen, Briefcase, Award } from "lucide-react";
import { useHomepageStats } from "@/hooks/use-courses";

const iconMap = {
  users: Users,
  book: BookOpen,
  briefcase: Briefcase,
  award: Award,
} as const;

export function StatsSection() {
  const { data, isLoading, error } = useHomepageStats();

  const stats = data
    ? [
        { label: "طالب نشط", value: data.students, icon: "users" },
        { label: "دورة متاحة", value: data.courses, icon: "book" },
        { label: "حرفي معتمد", value: data.artisans, icon: "briefcase" },
        { label: "جلسة مسجلة", value: data.sessions, icon: "award" },
      ]
    : [];

  if (error) {
    return (
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            تعذر تحميل الإحصاءات الآن. حاول مرة أخرى لاحقاً.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {isLoading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-[170px] animate-pulse rounded-2xl border border-border bg-muted/40" />
            ))}

          {!isLoading &&
            stats.map((stat, i) => {
              const Icon = iconMap[stat.icon as keyof typeof iconMap] || Users;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-card"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="mt-4 text-3xl font-bold text-foreground">
                    {stat.value.toLocaleString("ar-DZ")}+
                  </span>
                  <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
                </motion.div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
