import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, LoaderCircle, Search, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { searchCatalog, type SearchResult } from "@/lib/search.functions";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = { className?: string; onNavigate?: () => void; variant?: "default" | "hero" };

export function SearchInput({ className, onNavigate, variant = "default" }: SearchInputProps) {
  const search = useServerFn(searchCatalog);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await search({ data: { query: value } }));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, search]);

  const visible = open && query.trim().length >= 2;
  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="ابحث عن دورة أو مهنة..."
        className={cn(
          "min-w-0 pr-9 pl-8 text-sm",
          variant === "hero"
            ? "h-12 rounded-xl border-0 bg-primary-foreground/95 text-slate-900 placeholder:text-slate-500 shadow-hero focus-visible:bg-primary-foreground dark:text-slate-950 dark:placeholder:text-slate-600"
            : "h-9 rounded-full border-border/70 bg-muted/45 focus-visible:bg-background",
        )}
        aria-label="البحث في المنصة"
      />
      {query && (
        <button type="button" onClick={() => { setQuery(""); setResults([]); }} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="مسح البحث">
          <X className="h-4 w-4" />
        </button>
      )}

      {visible && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-xl" role="listbox">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" /> جارٍ البحث...</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">لا توجد نتائج مطابقة لـ «{query.trim()}»</div>
          ) : results.map((result) => (
            result.kind === "course" ? (
              <Link key={`course-${result.id}`} to="/courses/$courseId" params={{ courseId: result.id }} onClick={close} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-right transition-colors hover:bg-muted">
                <ResultIcon kind={result.kind} />
                <ResultText result={result} />
              </Link>
            ) : (
              <Link key={`artisan-${result.id}`} to="/courses" onClick={close} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-right transition-colors hover:bg-muted">
                <ResultIcon kind={result.kind} />
                <ResultText result={result} />
              </Link>
            )
          ))}
        </div>
      )}
    </div>
  );
}

function ResultIcon({ kind }: { kind: SearchResult["kind"] }) {
  const Icon = kind === "course" ? BookOpen : UserRound;
  return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>;
}

function ResultText({ result }: { result: SearchResult }) {
  return <span className="min-w-0"><span className="block truncate text-sm font-semibold text-foreground">{result.title}</span><span className="block truncate text-xs text-muted-foreground">{result.meta} · {result.summary}</span></span>;
}
