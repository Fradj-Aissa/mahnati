import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Users, GraduationCap, Hammer, Shield, BookOpen, Calendar } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const fn = useServerFn(getAdminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي المستخدمين" value={data?.totalUsers ?? 0} icon={Users} tone="primary" />
        <StatCard label="الطلاب" value={data?.students ?? 0} icon={GraduationCap} tone="accent" delay={0.05} />
        <StatCard label="الحرفيون (المستخدمون)" value={data?.artisans ?? 0} icon={Hammer} tone="success" delay={0.1} />
        <StatCard label="المدراء" value={data?.admins ?? 0} icon={Shield} tone="warning" delay={0.15} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="الدورات" value={data?.totalCourses ?? 0} icon={BookOpen} tone="primary" />
        <StatCard label="الحرفيون (السجل)" value={data?.totalArtisans ?? 0} icon={Hammer} tone="accent" delay={0.05} />
        <StatCard label="الجلسات" value={data?.totalSessions ?? 0} icon={Calendar} tone="success" delay={0.1} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>آخر المستخدمين المسجّلين</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recent?.length ? (
            <ul className="divide-y divide-border">
              {data.recent.map((u) => (
                <li key={u.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-foreground">{u.full_name || "بدون اسم"}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("ar")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">لا يوجد مستخدمون بعد.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
