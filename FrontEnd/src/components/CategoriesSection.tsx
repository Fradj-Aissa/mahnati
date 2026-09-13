import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useHomepageCategories } from "@/hooks/use-courses";
import catSpeaking from "@/assets/cat-speaking.png";
import catLanguages from "@/assets/cat-languages.png";
import catPlumbing from "@/assets/cat-plumbing.png";
import catSewing from "@/assets/cat-sewing.png";

const categoryImageMap = {
  speaking: catSpeaking,
  languages: catLanguages,
  plumbing: catPlumbing,
  sewing: catSewing,
  default: catLanguages,
} as const;

export function CategoriesSection() {
  const { data: categories = [], isLoading, error } = useHomepageCategories();

  if (error) {
    return (
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            تعذر تحميل التخصصات في الوقت الحالي. حاول مرة أخرى لاحقاً.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            التخصصات المتاحة
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            اختر التخصص الذي يناسم طموحك وابدأ رحلتك المهنية اليوم
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[260px] animate-pulse rounded-2xl border border-border bg-card/70"
              />
            ))}

          {!isLoading &&
            categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link
                  to="/courses"
                  search={{ category: cat.title }}
                  className="group flex h-full flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
                >
                  <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${cat.color}`}>
                    <img
                      src={categoryImageMap[cat.imageKey] ?? categoryImageMap.default}
                      alt={cat.title}
                      width={48}
                      height={48}
                      loading="lazy"
                      className="h-12 w-12 object-contain"
                    />
                  </div>
                  <div className="mt-5 flex w-full items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-foreground">{cat.title}</h3>
                    <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {cat.courseCount} دورات
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    استكشف التخصص
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
