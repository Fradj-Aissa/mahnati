import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { pb } from "@/integrations/pocketbase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "إنشاء حساب — مهنتي" }] }),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, { message: "الاسم قصير جداً" }).max(100),
  username: z.string().trim().min(3, { message: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" }).max(50).regex(/^[a-zA-Z0-9_.-]+$/, { message: "اسم المستخدم يقبل الأحرف والأرقام و _ و . و - فقط" }),
  email: z.string().trim().email({ message: "بريد إلكتروني غير صالح" }).max(255).optional().or(z.literal("")),
  contactMethod: z.enum(["email", "phone"]),
  phone: z.string().trim().regex(/^\+?[0-9\s()-]{8,20}$/, { message: "رقم الهاتف غير صالح" }).optional().or(z.literal("")),
  dateOfBirth: z.string().min(1, { message: "يرجى إدخال تاريخ الميلاد" }),
  profilePicture: z.instanceof(File).optional(),
  password: z.string().min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }).max(72),
}).superRefine((data, ctx) => {
  if (data.contactMethod === "email" && !data.email) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "يرجى إدخال البريد الإلكتروني" });
  }
  if (data.contactMethod === "phone" && !data.phone) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: "يرجى إدخال رقم الهاتف" });
  }
});

function SignupPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | undefined>();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/" });
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ fullName, username, email, contactMethod, phone, dateOfBirth, profilePicture, password });
    if (!parsed.success) {
      toast.error("خطأ في البيانات", { description: parsed.error.issues[0].message });
      return;
    }

    setSubmitting(true);
    let error: unknown;
    try {
      const formData = new FormData();
      formData.append("email", parsed.data.email);
      formData.append("password", parsed.data.password);
      formData.append("passwordConfirm", parsed.data.password);
      formData.append("name", parsed.data.fullName);
      formData.append("username", parsed.data.username);
      formData.append("contact_method", parsed.data.contactMethod);
      formData.append("phone", parsed.data.phone ?? "");
      formData.append("date_of_birth", parsed.data.dateOfBirth);
      formData.append("role", "student");
      if (parsed.data.profilePicture) formData.append("avatar", parsed.data.profilePicture);
      await pb.collection("users").create(formData);
      await pb.collection("users").authWithPassword(
        parsed.data.contactMethod === "phone" ? parsed.data.username : parsed.data.email,
        parsed.data.password,
      );
    } catch (caught) {
      error = caught;
    }
    setSubmitting(false);

    if (error) {
      const response = typeof error === "object" && error !== null && "response" in error
        ? (error as { response?: Record<string, { message?: string }> }).response
        : undefined;
      const fieldMessage = response
        ? Object.values(response).find((field) => field?.message)?.message
        : undefined;
      const message = fieldMessage || (error instanceof Error ? error.message : "تعذر إنشاء الحساب");
      const raw = message.toLowerCase();
      const msg = raw.includes("already registered") || raw.includes("already been registered")
        ? "هذا البريد مسجل بالفعل"
        : raw.includes("weak") || raw.includes("pwned")
          ? "كلمة المرور ضعيفة أو مسربة، اختر كلمة مرور أقوى (أحرف وأرقام ورموز)"
          : raw.includes("invalid email")
            ? "بريد إلكتروني غير صالح"
            : raw.includes("fetch") || raw.includes("network")
              ? "تعذر الاتصال بالخادم، حاول مرة أخرى"
              : message;
      toast.error("فشل إنشاء الحساب", { description: msg });
      return;
    }

    toast.success("تم إنشاء الحساب", { description: "مرحباً بك في مهنتي 🎉" });
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">إنشاء حساب جديد</h1>
          <p className="text-sm text-muted-foreground">ابدأ رحلتك التعليمية معنا</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="محمد أحمد"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">اسم المستخدم</Label>
            <Input
              id="username"
              type="text"
              dir="ltr"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="mohamed_ahmed"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني {contactMethod === "email" ? "" : "(اختياري)"}</Label>
            <Input
              id="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required={contactMethod === "email"}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactMethod">وسيلة التواصل المفضلة</Label>
              <select
                id="contactMethod"
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value as "email" | "phone")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="email">البريد الإلكتروني</option>
                <option value="phone">رقم الهاتف</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف {contactMethod === "phone" ? "" : "(اختياري)"}</Label>
              <Input
                id="phone"
                type="tel"
                dir="ltr"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+966 50 000 0000"
                required={contactMethod === "phone"}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">تاريخ الميلاد</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profilePicture">الصورة الشخصية</Label>
              <Input
                id="profilePicture"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setProfilePicture(e.target.files?.[0])}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">8 أحرف على الأقل</p>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            إنشاء الحساب
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
