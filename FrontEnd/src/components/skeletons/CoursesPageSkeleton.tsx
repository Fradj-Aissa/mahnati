import { Skeleton } from "@/components/ui/skeleton";
import { CourseCardSkeleton } from "./HomePageSkeleton";

export function CoursesPageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <section className="gradient-hero py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Skeleton className="mx-auto h-10 w-64 bg-primary-foreground/10" />
          <Skeleton className="mx-auto mt-3 h-5 w-96 bg-primary-foreground/10" />
          <Skeleton className="mx-auto mt-8 h-14 w-full max-w-xl rounded-2xl bg-primary-foreground/10" />
        </div>
      </section>

      {/* Filters + Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Category filters */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-md" />
          ))}
        </div>

        <Skeleton className="mb-6 h-4 w-24" />

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
