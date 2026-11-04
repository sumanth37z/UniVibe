import { cn } from "@/lib/utils";
import { categoryMeta, modeLabel } from "@/lib/constants";

export function CategoryBadge({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  const meta = categoryMeta(category);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1",
        meta.chip,
        className
      )}
    >
      <meta.icon className="size-3.5" strokeWidth={2.2} />
      {meta.label}
    </span>
  );
}

export function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-ink/[0.06] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-2 ring-1 ring-ink/10",
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
    draft: "bg-stone-200 text-stone-700 ring-stone-500/20",
    cancelled: "bg-red-100 text-red-700 ring-red-600/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1",
        styles[status] ?? styles.draft
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function ModePill({ mode }: { mode: string }) {
  return <Pill>{modeLabel(mode)}</Pill>;
}
