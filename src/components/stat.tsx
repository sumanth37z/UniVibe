import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "paper",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "paper" | "ink" | "iris" | "lime";
}) {
  const tones = {
    paper: "bg-cream ring-ink/10 text-ink",
    ink: "bg-ink ring-ink text-cream",
    iris: "bg-iris ring-iris-deep text-cream",
    lime: "bg-lime ring-lime text-ink",
  } as const;

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-3xl p-5 ring-1 transition-transform duration-200 hover:-translate-y-0.5",
        tones[tone]
      )}
    >
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-[11px] font-bold uppercase tracking-[0.15em]",
            tone === "paper" ? "text-ink-3" : "opacity-60"
          )}
        >
          {label}
        </p>
        <Icon
          className={cn("size-4.5", tone === "paper" ? "text-iris" : "opacity-80")}
          strokeWidth={2.2}
        />
      </div>
      <div className="mt-5">
        <p className="font-display text-[34px] font-bold leading-none tracking-tight tabular-nums">
          {value}
        </p>
        {hint && (
          <p className={cn("mt-1.5 text-xs font-medium", tone === "paper" ? "text-ink-3" : "opacity-60")}>
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
