import { createFileRoute, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { checkIsAdmin } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "لوحة الإدارة — مهنتي" }] }),
});

const titles: Record<string, string> = {
  "/admin": "نظرة عامة",
  "/admin/users": "إدارة المستخدمين",
  "/admin/courses": "إدارة الدورات",
  "/admin/artisans": "إدارة الحرفيين",
  "/admin/sessions": "إدارة الجلسات",
};

function AdminLayout() {
  const navigate = useNavigate();
  const check = useServerFn(checkIsAdmin);
  const { data, isLoading, error } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => check(),
    retry: false,
  });

  const path = useRouterState({ select: (r) => r.location.pathname });
  const title = titles[path] ?? "لوحة الإدارة";

  useEffect(() => {
    if (!isLoading && data && !data.isAdmin) {
      toast.error("غير مصرح: هذه الصفحة للمدراء فقط");
      navigate({ to: "/dashboard" });
    }
    if (error) {
      toast.error("فشل التحقق من الصلاحيات");
      navigate({ to: "/dashboard" });
    }
  }, [data, isLoading, error, navigate]);

  if (isLoading || !data?.isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div dir="rtl" className="flex min-h-screen w-full bg-muted/30">
        <AdminSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-lg font-bold text-foreground sm:text-xl">{title}</h1>
            </div>
            <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
              وضع المدير
            </span>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
