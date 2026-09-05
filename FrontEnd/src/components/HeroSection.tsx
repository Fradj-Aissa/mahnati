import { motion } from "framer-motion";
import { Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import heroBg from "@/assets/hero-bg.jpg";
import { SearchInput } from "@/components/SearchInput";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      {/* Decorative circles */}
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium text-primary-foreground">
              🎓 رحلتك نحو الاحتراف تبدأ من هنا
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              ابنِ مهنتك
              <br />
              <span className="text-accent">من هنا</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
              منصة تعليمية رقمية تجمع بين النظري والتطبيقي في مجالات مثل الخطابة واللغات والسباكة والخياطة، مع دعم التربصات الميدانية.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-10 max-w-xl"
          >
            <div className="hidden flex items-center gap-2 rounded-2xl bg-primary-foreground/95 p-2 shadow-hero backdrop-blur-sm">
              <Search className="mr-3 h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="ابحث عن دورة، تخصص، أو مهارة..."
                className="flex-1 bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <Button size="sm" className="shrink-0">
                بحث
              </Button>
            </div>
          </motion.div>

          <div className="mx-auto mt-10 max-w-xl">
            <SearchInput variant="hero" className="w-full text-right" />
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <Button asChild size="lg" className="gradient-accent border-0 text-primary-foreground shadow-lg">
              <Link to="/courses">
                تصفح الدورات
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/">تعرف علينا</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
