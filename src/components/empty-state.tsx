import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-ink/20 bg-cream/60 px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-5 grid size-16 place-items-center rounded-2xl bg-ink text-lime shadow-[0_12px_24px_-12px_rgba(23,19,16,0.5)]">
        <Icon className="size-7" strokeWidth={1.8} />
      </div>
      <h3 className="font-display text-xl font-bold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-2">{body}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-transform duration-200 hover:scale-[1.03]"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
