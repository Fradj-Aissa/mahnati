import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, FileText, X } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { listCourses, createCourse, updateCourse, deleteCourse } from "@/lib/admin.functions";
import { toast } from "sonner";
import { pb } from "@/integrations/pocketbase/client";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  component: AdminCourses,
});

type CourseForm = {
  title: string;
  category: string;
  instructor: string;
  description: string;
  students: number;
  status: "draft" | "published";
  thumbnailFile?: File;
  attachments?: string[];
  attachmentFiles?: File[];
};

const empty: CourseForm = {
  title: "", category: "", instructor: "", description: "", students: 0, status: "draft", attachments: [], attachmentFiles: [],
};

function AdminCourses() {
  const qc = useQueryClient();
  const list = useServerFn(listCourses);
  const create = useServerFn(createCourse);
  const update = useServerFn(updateCourse);
  const del = useServerFn(deleteCourse);

  const { data, isLoading } = useQuery({ queryKey: ["admin-courses"], queryFn: () => list() });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseForm>(empty);
  const [savingCourse, setSavingCourse] = useState(false);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const handleThumbnailInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("يرجى اختيار صورة PNG أو JPG أو WebP");
      return;
    }
    setForm((prev) => ({ ...prev, thumbnailFile: file }));
    event.target.value = "";
  };

  const handleAttachmentInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const invalid = files.find((file) => file.type !== "application/pdf");
    if (invalid) {
      toast.error("يرجى اختيار ملفات PDF فقط");
      return;
    }
    setForm((prev) => ({ ...prev, attachmentFiles: [...(prev.attachmentFiles ?? []), ...files] }));
    event.target.value = "";
  };

  const createMut = useMutation({
    mutationFn: (v: FormData) => create({ data: v }),
    onSuccess: () => { toast.success("تم إنشاء الدورة"); setOpen(false); setForm(empty); refresh(); },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "تعذر إنشاء الدورة"),
  });
  const updateMut = useMutation({
    mutationFn: (v: FormData) => update({ data: v }),
    onSuccess: () => { toast.success("تم تحديث الدورة"); setOpen(false); setEditId(null); setForm(empty); refresh(); },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "تعذر تحديث الدورة"),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: ({ deletedDependents }) => {
      toast.success("تم حذف الدورة", {
        description: deletedDependents > 0 ? `تم أيضاً حذف ${deletedDependents} سجل مرتبط بها.` : undefined,
      });
      refresh();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "تعذر حذف الدورة";
      toast.error("تعذر حذف الدورة", { description: message });
    },
  });

  const openCreate = () => {
    setEditId(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (c: { id: string; title: string; category: string; instructor: string; description?: string | null; students?: number; status: "draft" | "published"; thumbnail_url?: string | null; attachments?: string[] }) => {
    setEditId(c.id);
    setForm({
      title: c.title, category: c.category, instructor: c.instructor,
      description: c.description ?? "", students: c.students ?? 0, status: c.status,
      thumbnailFile: undefined,
      attachments: c.attachments ?? [],
      attachmentFiles: [],
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.title || !form.category || !form.instructor) {
      toast.error("املأ الحقول المطلوبة");
      return;
    }

    if (!form.thumbnailFile && !editId) {
      toast.error("اختر صورة غلاف للدورة");
      return;
    }

    try {
      setSavingCourse(true);
      toast.loading("جارٍ حفظ الدورة...", { id: "save-course" });

      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("category", form.category);
      payload.append("instructor", form.instructor);
      payload.append("description", form.description);
      payload.append("students", String(form.students));
      payload.append("status", form.status);
      if (form.thumbnailFile) payload.append("thumbnail", form.thumbnailFile);
      form.attachmentFiles?.forEach((file) => payload.append("attachments", file));

      if (editId) {
        payload.append("id", editId);
        updateMut.mutate(payload);
      } else createMut.mutate(payload);

      toast.dismiss("save-course");
    } catch (error: unknown) {
      toast.dismiss("save-course");
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء حفظ الدورة");
    } finally {
      setSavingCourse(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{data?.length ?? 0} دورة</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="ml-2 h-4 w-4" />
              دورة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>{editId ? "تعديل الدورة" : "إضافة دورة جديدة"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>العنوان *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>الفئة *</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div>
                  <Label>المدرّب *</Label>
                  <Input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>عدد الطلاب</Label>
                  <Input type="number" value={form.students}
                    onChange={(e) => setForm({ ...form, students: Number(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>الحالة</Label>
                  <Select value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v as "draft" | "published" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="published">منشورة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>صورة الغلاف</Label>
                <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleThumbnailInput} />
                <div className="mt-1 text-xs text-muted-foreground">
                  {form.thumbnailFile?.name ?? (editId ? "الصورة الحالية محفوظة" : "اختر صورة PNG أو JPG أو WebP")}
                </div>
              </div>
              <div>
                <Label>ملفات الدورة (PDF)</Label>
                <Input type="file" accept="application/pdf,.pdf" multiple onChange={handleAttachmentInput} />
                {(form.attachmentFiles ?? []).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {form.attachmentFiles?.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md border px-2 py-1 text-sm">
                        <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-destructive" />{file.name}</span>
                        <button type="button" aria-label={`حذف ${file.name}`} onClick={() => setForm({ ...form, attachmentFiles: form.attachmentFiles?.filter((_, i) => i !== index) })}>
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {(form.attachments ?? []).length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">{form.attachments?.length} ملف محفوظ مسبقاً</p>
                )}
              </div>
              <div>
                <Label>الوصف</Label>
                <Textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
              <Button onClick={submit} disabled={createMut.isPending || updateMut.isPending || savingCourse}>
                {savingCourse ? "جارٍ حفظ الدورة..." : editId ? "حفظ" : "إنشاء"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">الفئة</TableHead>
                  <TableHead className="text-right">المدرّب</TableHead>
                  <TableHead className="text-right">الطلاب</TableHead>
                  <TableHead className="text-right">المرفقات</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>{c.category}</TableCell>
                    <TableCell className="text-muted-foreground">{c.instructor}</TableCell>
                    <TableCell>{c.students}</TableCell>
                    <TableCell>
                      {(Array.isArray(c.attachments) ? c.attachments : c.attachments ? [c.attachments] : []).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(c.attachments) ? c.attachments : [c.attachments]).map((file: string, index: number) => (
                            <a key={`${file}-${index}`} href={pb.files.getURL(c, file)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                              <FileText className="h-3 w-3" /> PDF {index + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.status === "published" ? "default" : "secondary"}>
                        {c.status === "published" ? "منشورة" : "مسودة"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(c)}>
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
                              <AlertDialogTitle>حذف الدورة</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف "{c.title}"؟ سيتم حذف الدروس والتسجيلات والسجلات المرتبطة بها نهائياً.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => delMut.mutate(c.id)}
                                disabled={delMut.isPending}
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(data ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا توجد دورات بعد
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
