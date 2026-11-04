import Link from "next/link";
import { ArrowUpRight, MapPin, Users } from "lucide-react";

import { Poster } from "@/components/poster";
import { CategoryBadge } from "@/components/badges";
import { fmtDate, fmtShort, inr } from "@/lib/utils";
import type { EventCardData } from "@/lib/types";

export function EventCard({ event }: { event: EventCardData }) {
  const spotsLeft = Math.max(event.capacity - event.registered, 0);
  const pct = Math.min(
    Math.round((event.registered / Math.max(event.capacity, 1)) * 100),
    100
  );
  const isPast = new Date(event.startsAt) < new Date();

  return (
    <Link
      href={`/events/${event.id}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-cream ring-1 ring-ink/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(23,19,16,0.35)] hover:ring-ink/20"
    >
      <div className="relative">
        <Poster
          id={event.id}
          category={event.category}
          hue={event.hue}
          className="h-36"
        />
        <div className="absolute left-4 top-4 rounded-2xl bg-cream/95 px-3 py-1.5 text-center shadow-sm ring-1 ring-ink/10">
          <div className="font-display text-lg font-bold leading-none tracking-tight">
            {fmtShort(event.startsAt).split(" ")[0]}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-3">
            {fmtShort(event.startsAt).split(" ")[1]}
          </div>
        </div>
        {event.featured > 0 && (
          <span className="absolute right-4 top-4 rounded-full bg-lime px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-ink">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <CategoryBadge category={event.category} />
          <ArrowUpRight className="size-4 shrink-0 text-ink-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
        </div>

        <div>
          <h3 className="font-display text-[19px] font-bold leading-snug tracking-tight line-clamp-2">
            {event.title}
          </h3>
          <p className="mt-1 text-sm font-medium text-ink-3">
            {event.hostShortName} · {event.city}
          </p>
        </div>

        <div className="mt-auto space-y-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink-2">
            <MapPin className="size-3.5 text-ink-3" />
            <span className="truncate">
              {event.mode === "online" ? "Online event" : event.venue}
            </span>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-ink-3">
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" />
                {event.registered}/{event.capacity}
              </span>
              <span className={spotsLeft === 0 ? "text-red-600" : ""}>
                {spotsLeft === 0
                  ? "Full"
                  : event.feeInr === 0
                    ? inr(0)
                    : `${inr(event.feeInr)} · ${spotsLeft} left`}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-ink/[0.08]">
              <div
                className={
                  spotsLeft === 0 || isPast
                    ? "h-full rounded-full bg-ink-3/60"
                    : "h-full rounded-full bg-iris transition-all duration-500"
                }
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
