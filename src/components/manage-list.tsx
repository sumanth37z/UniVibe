"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { StatusPill } from "@/components/badges";
import { Poster } from "@/components/poster";
import { deleteEvent } from "@/lib/actions/events";
import type { EventCardData } from "@/lib/types";
import { cn, fmtDate, plural } from "@/lib/utils";

function RowActions({
  event,
  onDelete,
  pendingId,
}: {
  event: EventCardData;
  onDelete: (id: string) => void;
  pendingId: string | null;
}) {
  const [confirming, setConfirming] = useState(false);
  const busy = pendingId === event.id;

  return (
    <div className="flex items-center gap-2">
      {confirming ? (
        <span className="flex items-center gap-2 rounded-full bg-red-50 px-2.5 py-1.5 ring-1 ring-red-200">
          <button
            onClick={() => {
              onDelete(event.id);
              setConfirming(false);
            }}
            disabled={busy}
            className="text-xs font-bold text-red-700 hover:text-red-900"
          >
            {busy ? "Deleting…" : "Confirm delete"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            aria-label="Cancel delete"
            className="grid size-5 place-items-center rounded-full text-red-400 hover:text-red-700"
          >
            <X className="size-3.5" />
          </button>
        </span>
      ) : (
        <>
          <Link
            href={`/events/${event.id}`}
            title="View public page"
            className="grid size-9 place-items-center rounded-xl bg-ink/[0.05] text-ink-2 ring-1 ring-ink/10 transition-colors hover:bg-ink hover:text-cream"
          >
            <Eye className="size-4" />
          </Link>
          <Link
            href={`/events/${event.id}/edit`}
            title="Edit"
            className="grid size-9 place-items-center rounded-xl bg-ink/[0.05] text-ink-2 ring-1 ring-ink/10 transition-colors hover:bg-ink hover:text-cream"
          >
            <Pencil className="size-4" />
          </Link>
          <button
            onClick={() => setConfirming(true)}
            title="Delete"
            className={cn(
              "grid size-9 place-items-center rounded-xl ring-1 transition-colors",
              "bg-ink/[0.05] text-red-600 ring-ink/10 hover:bg-red-50 hover:ring-red-200"
            )}
          >
            <Trash2 className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}

export function ManageList({ events }: { events: EventCardData[] }) {
  const [optimisticEvents, removeEvent] = useOptimistic(
    events,
    (current: EventCardData[], id: string) => current.filter((e) => e.id !== id)
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDelete(id: string) {
    setPendingId(id);
    startTransition(async () => {
      removeEvent(id);
      const r = await deleteEvent(id);
      setPendingId(null);
      if (r.ok) toast.success("Event deleted");
      else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-3">
      {optimisticEvents.map((event) => {
        const pct = Math.min(
          Math.round((event.registered / Math.max(event.capacity, 1)) * 100),
          100
        );
        return (
          <div
            key={event.id}
            className="flex flex-col gap-4 rounded-2xl bg-cream p-4 ring-1 ring-ink/10 transition-shadow hover:shadow-[0_16px_32px_-20px_rgba(23,19,16,0.3)] sm:flex-row sm:items-center"
          >
            <Poster
              id={event.id}
              category={event.category}
              hue={event.hue}
              className="h-20 w-full shrink-0 rounded-xl sm:h-16 sm:w-24"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={event.status} />
                <span className="text-xs font-semibold text-ink-3">
                  {fmtDate(event.startsAt)}
                </span>
              </div>
              <Link
                href={`/events/${event.id}`}
                className="mt-1 block truncate font-display text-lg font-bold tracking-tight hover:underline"
              >
                {event.title}
              </Link>
              <div className="mt-2 flex max-w-xs items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.08]">
                  <div className="h-full rounded-full bg-iris" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-semibold text-ink-3">
                  {event.registered}/{event.capacity}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
              <p className="text-xs font-semibold text-ink-3">
                {plural(event.registered, "registration")}
              </p>
              <RowActions event={event} onDelete={handleDelete} pendingId={pendingId} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
