import { Link } from "@tanstack/react-router";
import { GraduationCap, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">مهنتي</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              منصة تعليمية رقمية تجمع بين التعلم النظري والتطبيقي لبناء مهارات مهنية حقيقية.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.instagram.com/minasatmihnati"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="إنستغرام"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:scale-110 hover:border-[oklch(0.6_0.2_25)]/50 hover:bg-[oklch(0.6_0.2_25)]/10 hover:text-[oklch(0.6_0.2_25)]"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/share/1Ateh6AWSy/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="فيسبوك"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:scale-110 hover:border-[oklch(0.55_0.18_250)]/50 hover:bg-[oklch(0.55_0.18_250)]/10 hover:text-[oklch(0.55_0.18_250)]"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">التخصصات</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/courses" className="hover:text-foreground">فن الخطابة</Link></li>
              <li><Link to="/courses" className="hover:text-foreground">اللغات</Link></li>
              <li><Link to="/courses" className="hover:text-foreground">السباكة</Link></li>
              <li><Link to="/courses" className="hover:text-foreground">الخياطة</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">المنصة</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground">من نحن</Link></li>
              <li><Link to="/" className="hover:text-foreground">التربصات</Link></li>
              <li><Link to="/" className="hover:text-foreground">الشهادات</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">تواصل معنا</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li dir="ltr" className="text-right">minasatmihnati@gmail.com</li>
              <li dir="ltr" className="text-right">0656783056</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © 2026 مهنتي. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
