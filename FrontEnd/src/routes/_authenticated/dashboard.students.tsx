import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listEnrolledStudents, updateEnrollmentStatus } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/students")({
  component: DashboardStudents,
  head: () => ({ meta: [{ title: "المتدربون — لوحة التحكم" }] }),
});

type StudentStatus = "in_progress" | "completed" | "saved";
type EnrolledStudent = {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  avatarUrl: string | null;
  courseId: string;
  courseTitle: string;
  status: StudentStatus;
  progress: number;
  updated: string;
};

const statusLabel: Record<StudentStatus, string> = {
  in_progress: "قيد الدراسة",
  completed: "أكمل الدورة",
  saved: "قيد الدراسة",
};

function DashboardStudents() {
  const queryClient = useQueryClient();
  const list = useServerFn(listEnrolledStudents);
  const updateStatus = useServerFn(updateEnrollmentStatus);
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | StudentStatus>("all");
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["dashboard-enrolled-students"],
    queryFn: async () => await list() as EnrolledStudent[],
  });
  const statusMutation = useMutation({
    mutationFn: (values: { enrollmentId: string; status: StudentStatus }) => updateStatus({ data: values }),
    onSuccess: () => {
      toast.success("تم تحديث حالة المتدرب");
      queryClient.invalidateQueries({ queryKey: ["dashboard-enrolled-students"] });
    },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "تعذر تحديث الحالة"),
  });

  const courses = useMemo(() => Array.from(new Map(data.map((student) => [student.courseId, student.courseTitle])).entries()), [data]);
  const filtered = data.filter((student) => (
    (courseFilter === "all" || student.courseId === courseFilter) &&
    (statusFilter === "all" || student.status === statusFilter)
  ));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Users className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">المتدربون المسجلون</h1>
          <p className="text-sm text-muted-foreground">مراجعة بيانات المسجلين ومتابعة تقدمهم في الدورات.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>قائمة المتدربين ({filtered.length})</CardTitle>
          <div className="grid gap-2 sm:grid-cols-2 sm:min-w-[28rem]">
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger><SelectValue placeholder="كل الدورات" /></SelectTrigger>
              <SelectContent><SelectItem value="all">كل الدورات</SelectItem>{courses.map(([id, title]) => <SelectItem key={id} value={id}>{title}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | StudentStatus)}>
              <SelectTrigger><SelectValue placeholder="كل الحالات" /></SelectTrigger>
              <SelectContent><SelectItem value="all">كل الحالات</SelectItem><SelectItem value="in_progress">قيد الدراسة</SelectItem><SelectItem value="completed">أكمل الدورة</SelectItem></SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? <div className="flex min-h-48 items-center justify-center"><LoaderCircle className="h-7 w-7 animate-spin text-primary" /></div> : isError ? <p className="p-6 text-center text-sm text-destructive">تعذر تحميل بيانات المتدربين.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead className="text-right">المتدرب</TableHead><TableHead className="text-right">بيانات التواصل</TableHead><TableHead className="text-right">الدورة</TableHead><TableHead className="text-right">الحالة</TableHead><TableHead className="text-right">الإجراء</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((student) => <TableRow key={student.id}>
                  <TableCell><div className="flex items-center gap-3"><Avatar><AvatarImage src={student.avatarUrl ?? undefined} alt={student.studentName} /><AvatarFallback>{student.studentName.slice(0, 1)}</AvatarFallback></Avatar><div><p className="font-medium">{student.studentName}</p><p className="text-xs text-muted-foreground">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("ar") : "تاريخ الميلاد غير مضاف"}</p></div></div></TableCell>
                  <TableCell className="text-sm text-muted-foreground"><p>{student.email || "لا يوجد بريد"}</p><p>{student.phone || "لا يوجد هاتف"}</p></TableCell>
                  <TableCell className="font-medium">{student.courseTitle}</TableCell>
                  <TableCell><Badge variant={student.status === "completed" ? "default" : "secondary"} className={student.status === "completed" ? "bg-success text-success-foreground" : ""}>{student.status === "completed" && <CheckCircle2 className="ml-1 h-3.5 w-3.5" />}{statusLabel[student.status]}</Badge><p className="mt-1 text-xs text-muted-foreground">{student.progress}%</p></TableCell>
                  <TableCell><Select value={student.status === "saved" ? "in_progress" : student.status} onValueChange={(status) => statusMutation.mutate({ enrollmentId: student.id, status: status as StudentStatus })}><SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="in_progress">قيد الدراسة</SelectItem><SelectItem value="completed">أكمل الدورة</SelectItem></SelectContent></Select></TableCell>
                </TableRow>)}
                {!filtered.length && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">لا توجد نتائج مطابقة للفلاتر.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
