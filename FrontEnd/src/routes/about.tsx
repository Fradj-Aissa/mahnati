import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, BookOpen, BriefcaseBusiness, Check, Eye, HeartHandshake, Lightbulb, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "تعرّف علينا | مهنتي" }, { name: "description", content: "منصة مهنتي تربط المهارات العملية بفرص النمو وسوق العمل." }] }),
  component: AboutPage,
});

const stats = [
  { value: "+2,500", label: "مستخدم يطوّر مهاراته", icon: Users },
  { value: "+80", label: "دورة ومسار عملي", icon: BookOpen },
  { value: "+120", label: "فرصة وخدمة مهنية", icon: BriefcaseBusiness },
  { value: "96%", label: "رضا مجتمعنا", icon: BadgeCheck },
];
const values = ["تعلّم عملي مرتبط باحتياجات السوق", "محتوى واضح ومناسب لكل مرحلة", "مجتمع داعم من الخبراء والمتعلمين", "فرص نمو قابلة للقياس والاستمرار"];

function AboutPage() {
  return <div className="overflow-hidden">
    <section className="relative isolate bg-gradient-to-bl from-primary/15 via-background to-accent/10 py-20 sm:py-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_15%,hsl(var(--primary)/0.18),transparent_35%)]" />
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-2 text-sm font-semibold text-primary"><HeartHandshake className="h-4 w-4" /> نكبر بالمهارة، ونصل بالفرصة</span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">مهنتي تربط الكفاءات بسوق العمل الحقيقي</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">نصنع مساحة عربية حديثة تساعدك على اكتساب مهارة عملية، بناء الثقة، والوصول إلى فرص تليق بطموحك.</p>
        <Button size="lg" className="mt-8" asChild><Link to="/courses">استكشف الدورات <ArrowLeft className="h-4 w-4" /></Link></Button>
      </div>
    </section>

    <section className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-12 sm:grid-cols-4 sm:gap-5 sm:px-6">
      {stats.map(({ value, label, icon: Icon }) => <div key={label} className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm"><Icon className="mx-auto h-5 w-5 text-primary" /><p className="mt-3 text-2xl font-extrabold text-foreground">{value}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{label}</p></div>)}
    </section>

    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6">
      <InfoCard icon={Target} title="رسالتنا" text="تمكين الأفراد من تعلّم مهارات مطلوبة وتحويل المعرفة إلى إنجاز مهني ملموس." />
      <InfoCard icon={Eye} title="رؤيتنا" text="أن تكون مهنتي الجسر الأكثر موثوقية بين الشغف، الكفاءة، وفرص العمل في العالم العربي." />
    </section>

    <section className="bg-muted/35 py-16"><div className="mx-auto max-w-6xl px-4 sm:px-6"><div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div><span className="text-sm font-bold text-primary">لماذا مهنتي؟</span><h2 className="mt-3 text-3xl font-extrabold text-foreground">كل ما تحتاجه لتبدأ بثقة</h2><p className="mt-4 leading-7 text-muted-foreground">نؤمن أن الفرصة تبدأ بمهارة متقنة، لذلك نصمم تجربة تعليمية إنسانية وعملية من أول درس إلى خطوتك التالية.</p></div><ul className="grid gap-3 sm:grid-cols-2">{values.map((value) => <li key={value} className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 text-sm font-semibold text-foreground"><span className="mt-0.5 rounded-full bg-success/15 p-1 text-success"><Check className="h-3.5 w-3.5" /></span>{value}</li>)}</ul></div></div></section>
  </div>;
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof Target; title: string; text: string }) {
  return <article className="rounded-2xl border border-border bg-card p-7 shadow-sm"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-6 w-6" /></span><h2 className="mt-5 text-2xl font-bold text-foreground">{title}</h2><p className="mt-3 leading-7 text-muted-foreground">{text}</p><Lightbulb className="mt-6 h-5 w-5 text-accent" /></article>;
}
