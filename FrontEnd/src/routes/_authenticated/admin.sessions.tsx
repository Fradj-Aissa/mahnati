import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { listSessions, createSession, setSessionStatus, deleteSession } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/sessions")({
  component: AdminSessions,
});

const statusLabel: Record<string, string> = {
  upcoming: "قادمة", completed: "مكتملة", cancelled: "ملغية",
};
const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  upcoming: "default", completed: "secondary", cancelled: "destructive",
};

type Form = { artisan_name: string; student_name: string; craft: string; scheduled_at: string };
const empty: Form = { artisan_name: "", student_name: "", craft: "", scheduled_at: "" };

function AdminSessions() {
  const qc = useQueryClient();
  const list = useServerFn(listSessions);
  const create = useServerFn(createSession);
  const setStatus = useServerFn(setSessionStatus);
  const del = useServerFn(deleteSession);

  const { data, isLoading } = useQuery({ queryKey: ["admin-sessions"], queryFn: () => list() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-sessions"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const createMut = useMutation({
    mutationFn: (v: Form) => create({
      data: { ...v, scheduled_at: new Date(v.scheduled_at).toISOString(), status: "upcoming" }
    }),
    onSuccess: () => { toast.success("تم إنشاء الجلسة"); setOpen(false); setForm(empty); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });
  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "upcoming" | "completed" | "cancelled" }) =>
      setStatus({ data: v }),
    onSuccess: () => { toast.success("تم تحديث الحالة"); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("تم الحذف"); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{data?.length ?? 0} جلسة</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm(empty)}>
              <Plus className="ml-2 h-4 w-4" />
              جلسة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader><DialogTitle>إنشاء جلسة</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>اسم الحرفي *</Label>
                <Input value={form.artisan_name}
                  onChange={(e) => setForm({ ...form, artisan_name: e.target.value })} />
              </div>
              <div>
                <Label>اسم الطالب *</Label>
                <Input value={form.student_name}
                  onChange={(e) => setForm({ ...form, student_name: e.target.value })} />
              </div>
              <div>
                <Label>الحرفة *</Label>
                <Input value={form.craft}
                  onChange={(e) => setForm({ ...form, craft: e.target.value })} />
              </div>
              <div>
                <Label>الموعد *</Label>
                <Input type="datetime-local" value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
              <Button onClick={() => {
                if (!form.artisan_name || !form.student_name || !form.craft || !form.scheduled_at) {
                  toast.error("املأ كل الحقول"); return;
                }
                createMut.mutate(form);
              }} disabled={createMut.isPending}>إنشاء</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الحرفي</TableHead>
                  <TableHead className="text-right">الطالب</TableHead>
                  <TableHead className="text-right">الحرفة</TableHead>
                  <TableHead className="text-right">الموعد</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.artisan_name}</TableCell>
                    <TableCell>{s.student_name}</TableCell>
                    <TableCell>{s.craft}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(s.scheduled_at).toLocaleString("ar")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[s.status]}>{statusLabel[s.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary"
                          title="قادمة"
                          onClick={() => statusMut.mutate({ id: s.id, status: "upcoming" })}>
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-success"
                          title="مكتملة"
                          onClick={() => statusMut.mutate({ id: s.id, status: "completed" })}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                          title="إلغاء"
                          onClick={() => statusMut.mutate({ id: s.id, status: "cancelled" })}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف الجلسة</AlertDialogTitle>
                              <AlertDialogDescription>هل أنت متأكد؟</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => delMut.mutate(s.id)}
                              >حذف</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(data ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      لا توجد جلسات بعد
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
