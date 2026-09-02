import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "الإعدادات — مهنتي" }] }),
});

const allInterests = ["فن الخطابة", "اللغات", "السباكة", "الخياطة", "الإلكترونيات", "النجارة"];

function SettingsPage() {
  const { user } = useAuth();
  const [interests, setInterests] = useState<string[]>(["فن الخطابة", "اللغات"]);
  const [notifs, setNotifs] = useState({ courses: true, community: true, sessions: true });

  const fullName = user?.user_metadata?.full_name || "";
  const initials = (fullName || user?.email || "U").split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();

  const toggleInterest = (i: string) =>
    setInterests((cur) => cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("تم حفظ التغييرات");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="account">الحساب</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <motion.form
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            onSubmit={onSave}
            className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-border">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
                </Avatar>
                <button type="button" className="absolute -bottom-1 -left-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="font-semibold text-foreground">صورة الملف الشخصي</p>
                <p className="text-sm text-muted-foreground">PNG أو JPG · أقل من 2MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>الاسم الكامل</Label>
                <Input defaultValue={fullName} placeholder="اسمك الكامل" />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input defaultValue={user?.email ?? ""} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>نبذة عنك</Label>
              <Textarea rows={3} placeholder="اكتب نبذة قصيرة عنك واهتماماتك..." />
            </div>

            <div className="space-y-2">
              <Label>اهتماماتك</Label>
              <div className="flex flex-wrap gap-2">
                {allInterests.map((i) => {
                  const on = interests.includes(i);
                  return (
                    <button type="button" key={i} onClick={() => toggleInterest(i)}>
                      <Badge
                        variant={on ? "default" : "outline"}
                        className={on ? "" : "hover:bg-muted cursor-pointer"}
                      >
                        {i}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button type="submit" className="gradient-accent border-0 text-primary-foreground">
              <Save className="h-4 w-4" /> حفظ التغييرات
            </Button>
          </motion.form>
        </TabsContent>

        <TabsContent value="account">
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <form onSubmit={onSave} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-bold text-foreground">تغيير البريد الإلكتروني</h3>
              <div className="space-y-2">
                <Label>البريد الجديد</Label>
                <Input type="email" placeholder="new@example.com" />
              </div>
              <Button type="submit">تحديث البريد</Button>
            </form>
            <form onSubmit={onSave} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-bold text-foreground">تغيير كلمة المرور</h3>
              <div className="space-y-2">
                <Label>كلمة المرور الحالية</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>كلمة المرور الجديدة</Label>
                <Input type="password" />
              </div>
              <Button type="submit">تحديث كلمة المرور</Button>
            </form>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            {[
              { key: "courses" as const, title: "إشعارات الدورات", desc: "دروس جديدة وتحديثات الدورات" },
              { key: "community" as const, title: "إشعارات المجتمع", desc: "ردود وإعجابات على منشوراتك" },
              { key: "sessions" as const, title: "تذكير الجلسات", desc: "تنبيهات قبل بدء جلسات الحرفيين" },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                <div>
                  <p className="font-semibold text-foreground">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.desc}</p>
                </div>
                <Switch
                  checked={notifs[n.key]}
                  onCheckedChange={(v) => {
                    setNotifs((p) => ({ ...p, [n.key]: v }));
                    toast.success("تم الحفظ");
                  }}
                />
              </div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
