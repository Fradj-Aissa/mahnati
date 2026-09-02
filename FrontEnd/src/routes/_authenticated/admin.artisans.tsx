import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Star, Plus, Trash2, Clock, Pencil, Search } from "lucide-react";
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
import {
  listArtisans, createArtisan, updateArtisan, setArtisanStatus, deleteArtisan,
} from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/artisans")({
  component: AdminArtisans,
});

const statusLabel: Record<string, string> = {
  approved: "معتمد", pending: "قيد المراجعة", rejected: "مرفوض",
};
const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  approved: "default", pending: "secondary", rejected: "destructive",
};
type Status = "approved" | "pending" | "rejected";
type Filter = "all" | Status;

type Form = { name: string; craft: string; bio: string; rating: number };
const empty: Form = { name: "", craft: "", bio: "", rating: 0 };

function AdminArtisans() {
  const qc = useQueryClient();
  const list = useServerFn(listArtisans);
  const create = useServerFn(createArtisan);
  const update = useServerFn(updateArtisan);
  const setStatus = useServerFn(setArtisanStatus);
  const del = useServerFn(deleteArtisan);

  const { data, isLoading } = useQuery({ queryKey: ["admin-artisans"], queryFn: () => list() });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-artisans"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const createMut = useMutation({
    mutationFn: (v: Form) => create({ data: { ...v, sessions_count: 0, status: "pending" } }),
    onSuccess: () => { toast.success("تمت إضافة الحرفي"); setCreateOpen(false); setForm(empty); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });
  const updateMut = useMutation({
    mutationFn: (v: { id: string; patch: Partial<Form> }) => update({ data: v }),
    onSuccess: () => { toast.success("تم التحديث"); setEditOpen(false); setEditingId(null); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });
  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: Status }) => setStatus({ data: v }),
    onSuccess: (_d, v) => {
      toast.success(v.status === "approved" ? "تم الاعتماد" : v.status === "rejected" ? "تم الرفض" : "تحديث الحالة");
      refresh();
    },
    onError: (e: any) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("تم الحذف"); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const counts = useMemo(() => {
    const c = { all: 0, approved: 0, pending: 0, rejected: 0 };
    (data ?? []).forEach((a: any) => { c.all++; c[a.status as Status]++; });
    return c;
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((a: any) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (q && !`${a.name} ${a.craft}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, filter, search]);

  const openEdit = (a: any) => {
    setEditingId(a.id);
    setForm({ name: a.name, craft: a.craft, bio: a.bio ?? "", rating: Number(a.rating) });
    setEditOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">الكل ({counts.all})</TabsTrigger>
            <TabsTrigger value="pending">قيد المراجعة ({counts.pending})</TabsTrigger>
            <TabsTrigger value="approved">معتمد ({counts.approved})</TabsTrigger>
            <TabsTrigger value="rejected">مرفوض ({counts.rejected})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث..." className="pr-8 w-48"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setForm(empty)}>
                <Plus className="ml-2 h-4 w-4" />حرفي جديد
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader><DialogTitle>إضافة حرفي</DialogTitle></DialogHeader>
              <ArtisanForm form={form} setForm={setForm} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>إلغاء</Button>
                <Button onClick={() => {
                  if (!form.name || !form.craft) { toast.error("املأ الحقول المطلوبة"); return; }
                  createMut.mutate(form);
                }} disabled={createMut.isPending}>إضافة</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>تعديل الحرفي</DialogTitle></DialogHeader>
          <ArtisanForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
            <Button onClick={() => {
              if (!editingId) return;
              if (!form.name || !form.craft) { toast.error("املأ الحقول المطلوبة"); return; }
              updateMut.mutate({ id: editingId, patch: form });
            }} disabled={updateMut.isPending}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">الحرفة</TableHead>
                  <TableHead className="text-right">التقييم</TableHead>
                  <TableHead className="text-right">الجلسات</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{a.craft}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        {Number(a.rating).toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>{a.sessions_count}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[a.status]}>{statusLabel[a.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-success"
                          title="اعتماد"
                          onClick={() => statusMut.mutate({ id: a.id, status: "approved" })}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-warning"
                          title="قيد المراجعة"
                          onClick={() => statusMut.mutate({ id: a.id, status: "pending" })}>
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                          title="رفض"
                          onClick={() => statusMut.mutate({ id: a.id, status: "rejected" })}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8"
                          title="تعديل" onClick={() => openEdit(a)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف الحرفي</AlertDialogTitle>
                              <AlertDialogDescription>هل أنت متأكد من حذف "{a.name}"؟</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => delMut.mutate(a.id)}
                              >حذف</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      لا يوجد نتائج
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

function ArtisanForm({ form, setForm }: { form: Form; setForm: (f: Form) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label>الاسم *</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <Label>الحرفة *</Label>
        <Input value={form.craft} onChange={(e) => setForm({ ...form, craft: e.target.value })} />
      </div>
      <div>
        <Label>التقييم (0-5)</Label>
        <Input type="number" step="0.1" min="0" max="5" value={form.rating}
          onChange={(e) => setForm({ ...form, rating: Number(e.target.value) || 0 })} />
      </div>
      <div>
        <Label>نبذة</Label>
        <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      </div>
    </div>
  );
}
