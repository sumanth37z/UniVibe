import { cn } from "@/lib/utils";
import { categoryMeta } from "@/lib/constants";

function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const PATTERNS = ["rings", "grid", "diag", "dots"] as const;

export function Poster({
  id,
  category,
  hue,
  className,
  iconClassName,
}: {
  id: string;
  category: string;
  hue: number;
  className?: string;
  iconClassName?: string;
}) {
  const meta = categoryMeta(category);
  const Icon = meta.icon;
  const h = (hue + 360) % 360;
  const seed = hashString(id);
  const pattern = PATTERNS[seed % PATTERNS.length];
  const gid = `p-${seed % 997}`;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background: `linear-gradient(125deg, hsl(${h} 74% 46%), hsl(${(h + 42) % 360} 78% 34%) 70%)`,
      }}
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.24] mix-blend-overlay"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 400 240"
      >
        <defs>
          {pattern === "rings" && (
            <pattern id={gid} width="72" height="72" patternUnits="userSpaceOnUse">
              <circle cx="36" cy="36" r="30" fill="none" stroke="white" strokeWidth="1.6" />
              <circle cx="36" cy="36" r="16" fill="none" stroke="white" strokeWidth="1.2" />
            </pattern>
          )}
          {pattern === "grid" && (
            <pattern id={gid} width="34" height="34" patternUnits="userSpaceOnUse">
              <path d="M34 0H0V34" fill="none" stroke="white" strokeWidth="1.1" />
            </pattern>
          )}
          {pattern === "diag" && (
            <pattern id={gid} width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
              <rect width="3.5" height="26" fill="white" />
            </pattern>
          )}
          {pattern === "dots" && (
            <pattern id={gid} width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="13" cy="13" r="3.4" fill="white" />
            </pattern>
          )}
        </defs>
        <rect width="400" height="240" fill={`url(#${gid})`} />
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 15% 0%, rgba(255,255,255,0.28), transparent 55%)",
        }}
      />

      <Icon
        className={cn(
          "absolute -bottom-5 -right-4 size-28 text-white/25 drop-shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6",
          iconClassName
        )}
        strokeWidth={1.4}
      />
      <Icon
        className="absolute left-3 top-3 size-5 text-white/85"
        strokeWidth={2}
      />
    </div>
  );
}
