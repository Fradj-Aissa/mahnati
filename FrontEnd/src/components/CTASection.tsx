import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CTASection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl gradient-hero p-10 text-center sm:p-16"
        >
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />

          <div className="relative">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-accent" />
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
              ابدأ رحلتك المهنية اليوم
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80">
              انضم لأكثر من 2500 طالب يبنون مستقبلهم المهني مع منصة مهنتي
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="gradient-accent border-0 text-primary-foreground">
                <Link to="/courses">
                  تصفح الدورات
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
