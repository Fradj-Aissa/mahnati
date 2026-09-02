import { Facebook, Phone, Mail, Instagram } from "lucide-react";

const contacts = [
  {
    icon: Facebook,
    title: "فيسبوك",
    description: "تابعنا على صفحتنا الرسمية",
    value: "منصة مهنتي",
    href: "https://www.facebook.com/share/1Ateh6AWSy/",
    external: true,
    iconBg: "bg-[oklch(0.55_0.18_250)]/10",
    iconColor: "text-[oklch(0.55_0.18_250)]",
    border: "border-[oklch(0.55_0.18_250)]/20 hover:border-[oklch(0.55_0.18_250)]/50",
    tint: "hover:bg-[oklch(0.55_0.18_250)]/5",
  },
  {
    icon: Phone,
    title: "اتصل بنا",
    description: "متاحون للرد على استفساراتكم",
    value: "0656783056",
    href: "tel:0656783056",
    external: false,
    iconBg: "bg-[oklch(0.6_0.15_150)]/10",
    iconColor: "text-[oklch(0.6_0.15_150)]",
    border: "border-[oklch(0.6_0.15_150)]/20 hover:border-[oklch(0.6_0.15_150)]/50",
    tint: "hover:bg-[oklch(0.6_0.15_150)]/5",
  },
  {
    icon: Instagram,
    title: "إنستغرام",
    description: "تابع آخر منشوراتنا وقصصنا",
    value: "@minasatmihnati",
    href: "https://www.instagram.com/minasatmihnati",
    external: true,
    iconBg: "bg-[oklch(0.6_0.2_25)]/10",
    iconColor: "text-[oklch(0.6_0.2_25)]",
    border: "border-[oklch(0.6_0.2_25)]/20 hover:border-[oklch(0.6_0.2_25)]/50",
    tint: "hover:bg-[oklch(0.6_0.2_25)]/5",
  },
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    description: "راسلنا في أي وقت",
    value: "minasatmihnati@gmail.com",
    href: "mailto:minasatmihnati@gmail.com",
    external: false,
    iconBg: "bg-[oklch(0.6_0.2_25)]/10",
    iconColor: "text-[oklch(0.6_0.2_25)]",
    border: "border-[oklch(0.6_0.2_25)]/20 hover:border-[oklch(0.6_0.2_25)]/50",
    tint: "hover:bg-[oklch(0.6_0.2_25)]/5",
  },
];

export function ContactSection() {
  return (
    <section dir="rtl" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            تواصل معنا
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            نحن هنا للإجابة على أسئلتك ومساعدتك في رحلتك المهنية. اختر الطريقة الأنسب لك للتواصل.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <a
                key={contact.title}
                href={contact.href}
                target={contact.external ? "_blank" : undefined}
                rel={contact.external ? "noopener noreferrer" : undefined}
                className={`group relative flex flex-col items-center rounded-2xl border bg-card p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl ${contact.border} ${contact.tint}`}
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${contact.iconBg} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className={`h-8 w-8 ${contact.iconColor}`} strokeWidth={2} />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {contact.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {contact.description}
                </p>
                <p
                  dir="ltr"
                  className={`mt-4 text-base font-medium ${contact.iconColor} break-all`}
                >
                  {contact.value}
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
