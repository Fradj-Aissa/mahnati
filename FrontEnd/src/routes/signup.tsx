import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState, type FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, GraduationCap, Loader2, UserRound } from "lucide-react";
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
  contact: z.string().trim().min(1, { message: "يرجى إدخال البريد الإلكتروني أو رقم الهاتف" }).max(255),
  dateOfBirth: z.string().min(1, { message: "يرجى إدخال تاريخ الميلاد" }),
  profilePicture: z.instanceof(File).optional(),
  password: z.string().min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }).max(72),
}).superRefine((data, ctx) => {
  if (data.contact.includes("@")) {
    const emailResult = z.string().email().safeParse(data.contact);
    if (!emailResult.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["contact"], message: "بريد إلكتروني غير صالح" });
    }
  } else if (!/^\+?[0-9\s()-]{8,20}$/.test(data.contact)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["contact"], message: "رقم الهاتف غير صالح" });
  }
});

function SignupPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | undefined>();
  const [profilePreview, setProfilePreview] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!profilePicture) {
      setProfilePreview(undefined);
      return;
    }
    const previewUrl = URL.createObjectURL(profilePicture);
    setProfilePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [profilePicture]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ fullName, contact, dateOfBirth, profilePicture, password });
    if (!parsed.success) {
      toast.error("خطأ في البيانات", { description: parsed.error.issues[0]?.message ?? "تحقق من البيانات المدخلة" });
      return;
    }

    setSubmitting(true);
    let error: unknown;
    try {
      const formData = new FormData();
      const fullNameValue = String(parsed.data.fullName ?? "");
      const contactValue = String(parsed.data.contact ?? "");
      const dateOfBirthValue = String(parsed.data.dateOfBirth ?? "");
      const passwordValue = String(parsed.data.password ?? "");
      const isEmail = contactValue.includes("@");
      formData.append("email", isEmail ? contactValue : "");
      formData.append("password", passwordValue);
      formData.append("passwordConfirm", passwordValue);
      formData.append("name", fullNameValue);
      formData.append("contact_method", isEmail ? "email" : "phone");
      formData.append("phone", isEmail ? "" : contactValue);
      formData.append("date_of_birth", dateOfBirthValue);
      formData.append("role", "student");
      if (parsed.data.profilePicture) formData.append("avatar", parsed.data.profilePicture);
      await pb.collection("users").create(formData);
      await pb.collection("users").authWithPassword(
        contactValue,
        passwordValue,
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
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-primary/40 bg-muted transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="اختيار صورة شخصية"
            >
              {profilePreview ? (
                <img src={profilePreview} alt="معاينة الصورة الشخصية" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="mx-auto h-10 w-10 text-muted-foreground" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Camera className="h-7 w-7 text-white" />
              </span>
            </button>
            <Input
              ref={fileInputRef}
              id="profilePicture"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => setProfilePicture(e.target.files?.[0])}
            />
          </div>

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
            <Label htmlFor="contact">البريد الإلكتروني أو رقم الهاتف</Label>
            <Input
              id="contact"
              type="text"
              dir="ltr"
              autoComplete="email tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="you@example.com أو +966 50 000 0000"
              required
            />
          </div>

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
