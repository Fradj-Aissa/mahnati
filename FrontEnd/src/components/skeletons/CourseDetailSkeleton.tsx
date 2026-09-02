import { Skeleton } from "@/components/ui/skeleton";

export function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <section className="gradient-hero py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="mb-4 h-4 w-24 bg-primary-foreground/10" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full bg-primary-foreground/10" />
                <Skeleton className="h-5 w-24 rounded-full bg-primary-foreground/10" />
              </div>
              <Skeleton className="mt-4 h-10 w-3/4 bg-primary-foreground/10" />
              <Skeleton className="mt-4 h-5 w-full bg-primary-foreground/10" />
              <Skeleton className="mt-2 h-5 w-2/3 bg-primary-foreground/10" />
              <div className="mt-6 flex flex-wrap items-center gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-16 bg-primary-foreground/10" />
                ))}
              </div>
              <Skeleton className="mt-3 h-4 w-32 bg-primary-foreground/10" />
            </div>
            {/* Enroll Card Skeleton */}
            <div className="w-full rounded-2xl border border-primary-foreground/10 bg-primary-foreground/10 p-6 lg:w-80">
              <div className="text-center">
                <Skeleton className="mx-auto h-8 w-20 bg-primary-foreground/15" />
                <Skeleton className="mx-auto mt-4 h-12 w-full rounded-lg bg-primary-foreground/15" />
                <Skeleton className="mx-auto mt-3 h-3 w-40 bg-primary-foreground/15" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Lessons */}
          <div className="lg:col-span-2">
            <Skeleton className="h-8 w-40" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="mt-1 h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <Skeleton className="h-5 w-28" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="mt-2 h-5 w-14 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
