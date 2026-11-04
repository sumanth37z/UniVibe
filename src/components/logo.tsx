import { cn } from "@/lib/utils";

export function Logo({
  className,
  dark = false,
  compact = false,
}: {
  className?: string;
  dark?: boolean;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-8 place-items-center rounded-[10px] transition-transform duration-300 group-hover:rotate-45",
          dark ? "bg-lime text-ink" : "bg-ink text-lime"
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-4.5" aria-hidden>
          <path
            d="M12 2v5M12 17v5M2 12h5M17 12h5M5.6 5.6l3.4 3.4M15 15l3.4 3.4M18.4 5.6 15 9M9 15l-3.4 3.4"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!compact && (
        <span
          className={cn(
            "font-display text-[19px] font-bold tracking-tight",
            dark ? "text-cream" : "text-ink"
          )}
        >
          univibe
        </span>
      )}
    </span>
  );
}
