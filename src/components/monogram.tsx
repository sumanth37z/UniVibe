import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  hue,
  className,
}: {
  name: string;
  hue: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 select-none place-items-center rounded-full text-[13px] font-bold text-white ring-2 ring-cream",
        className
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 62% 46%), hsl(${(hue + 40) % 360} 70% 38%))`,
        fontWeight: 700,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function CollegeMark({
  shortName,
  hue,
  className,
}: {
  shortName: string;
  hue: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 select-none place-items-center rounded-2xl font-display text-[13px] font-bold text-white ring-1 ring-black/10",
        className
      )}
      style={{
        background: `linear-gradient(140deg, hsl(${hue} 60% 42%), hsl(${(hue + 34) % 360} 66% 30%))`,
      }}
      aria-hidden
    >
      {shortName.slice(0, 3).toUpperCase()}
    </span>
  );
}
