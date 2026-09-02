import { Instagram } from "lucide-react";

export function InstagramFeed() {
  return (
    <section dir="rtl" className="py-16 sm:py-20 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[oklch(0.6_0.2_25)]/10">
            <Instagram className="h-6 w-6 text-[oklch(0.6_0.2_25)]" />
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            آخر منشوراتنا على إنستغرام
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            تابع آخر أخبارنا، دوراتنا وقصص نجاح متعلمينا.
          </p>
          <a
            href="https://www.instagram.com/minasatmihnati"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[oklch(0.6_0.2_25)] hover:underline"
          >
            <Instagram className="h-4 w-4" />
            @minasatmihnati
          </a>
        </div>

      </div>
    </section>
  );
}
