import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listEnrolledStudents } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/students")({
  component: AdminStudents,
  head: () => ({ meta: [{ title: "المتدربون — لوحة الإدارة" }] }),
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

function AdminStudents() {
  const list = useServerFn(listEnrolledStudents);
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_progress" | "completed">("all");
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["admin-enrolled-students"],
    queryFn: async () => await list() as EnrolledStudent[],
  });

  const courses = useMemo(() => Array.from(new Map(data.map((student) => [student.courseId, student.courseTitle])).entries()), [data]);
  const filtered = data.filter((student) => {
    const displayStatus = student.status === "completed" || student.progress >= 100 ? "completed" : "in_progress";
    return (courseFilter === "all" || student.courseId === courseFilter) &&
      (statusFilter === "all" || displayStatus === statusFilter);
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Users className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">المتدربون المسجلون</h1>
          <p className="text-sm text-muted-foreground">الدورات وجميع الطلبة المسجلين فيها وحالة تقدم كل متدرب.</p>
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
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "in_progress" | "completed")}>
              <SelectTrigger><SelectValue placeholder="كل الحالات" /></SelectTrigger>
              <SelectContent><SelectItem value="all">كل الحالات</SelectItem><SelectItem value="in_progress">قيد الدراسة</SelectItem><SelectItem value="completed">أكمل الدورة</SelectItem></SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? <div className="flex min-h-48 items-center justify-center"><LoaderCircle className="h-7 w-7 animate-spin text-primary" /></div> : isError ? <p className="p-6 text-center text-sm text-destructive">تعذر تحميل بيانات المتدربين.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead className="text-right">المتدرب</TableHead><TableHead className="text-right">بيانات التواصل</TableHead><TableHead className="text-right">الدورة</TableHead><TableHead className="text-right">الحالة</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((student) => {
                  const completed = student.status === "completed" || student.progress >= 100;
                  return <TableRow key={student.id}>
                    <TableCell><div className="flex items-center gap-3"><Avatar><AvatarImage src={student.avatarUrl ?? undefined} alt={student.studentName} /><AvatarFallback>{student.studentName.slice(0, 1)}</AvatarFallback></Avatar><div><p className="font-medium">{student.studentName}</p><p className="text-xs text-muted-foreground">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("ar") : "تاريخ الميلاد غير مضاف"}</p></div></div></TableCell>
                    <TableCell className="text-sm text-muted-foreground"><p>{student.email || "لا يوجد بريد"}</p><p>{student.phone || "لا يوجد هاتف"}</p></TableCell>
                    <TableCell className="font-medium">{student.courseTitle}</TableCell>
                    <TableCell><Badge variant={completed ? "default" : "secondary"} className={completed ? "bg-success text-success-foreground" : ""}>{completed && <CheckCircle2 className="ml-1 h-3.5 w-3.5" />}{completed ? "أكمل الدورة" : "قيد الدراسة"}</Badge><p className="mt-1 text-xs text-muted-foreground">{student.progress}%</p></TableCell>
                  </TableRow>;
                })}
                {!filtered.length && <TableRow><TableCell colSpan={4} className="py-10 text-center text-muted-foreground">لا توجد نتائج مطابقة للفلاتر.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
