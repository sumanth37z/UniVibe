"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  EyeOff,
  Loader2,
  Pencil,
  Trash2,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { deleteEvent, setEventStatus } from "@/lib/actions/events";
import { cn } from "@/lib/utils";

export function ManageEventActions({
  eventId,
  status,
}: {
  eventId: string;
  status: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function changeStatus(next: "draft" | "published" | "cancelled") {
    startTransition(async () => {
      const r = await setEventStatus(eventId, next);
      if (r.ok) toast.success(r.message);
      else toast.error(r.error);
    });
  }

  function doDelete() {
    startTransition(async () => {
      const r = await deleteEvent(eventId);
      if (r.ok) {
        toast.success("Event deleted");
        router.push("/my-events");
        router.refresh();
      } else {
        toast.error(r.error);
        setConfirmOpen(false);
      }
    });
  }

  return (
    <div className="space-y-2.5">
      <Link
        href={`/events/${eventId}/edit`}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-cream transition-all duration-200 hover:scale-[1.02] hover:bg-iris"
      >
        <Pencil className="size-4" />
        Edit event
      </Link>

      {status !== "published" ? (
        <button
          onClick={() => changeStatus("published")}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-100 px-6 py-3 text-sm font-bold text-emerald-800 ring-1 ring-emerald-600/30 transition-colors hover:bg-emerald-200 disabled:opacity-60"
        >
          <Upload className="size-4" />
          {status === "cancelled" ? "Reactivate" : "Publish"}
        </button>
      ) : (
        <button
          onClick={() => changeStatus("draft")}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-bold text-ink ring-1 ring-ink/15 transition-colors hover:ring-ink/40 disabled:opacity-60"
        >
          <EyeOff className="size-4" />
          Unpublish
        </button>
      )}

      {status !== "cancelled" && (
        <button
          onClick={() => changeStatus("cancelled")}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-bold text-amber-700 ring-1 ring-amber-300 transition-colors hover:bg-amber-50 disabled:opacity-60"
        >
          <Archive className="size-4" />
          Cancel event
        </button>
      )}

      <button
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
      >
        <Trash2 className="size-4" />
        Delete forever
      </button>

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-sm"
            onClick={() => !isPending && setConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 12 }}
              transition={{ type: "spring", damping: 24, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-cream p-7 ring-1 ring-ink/10"
            >
              <div className="grid size-12 place-items-center rounded-2xl bg-red-100 text-red-600">
                <TriangleAlert className="size-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold tracking-tight">
                Delete this event?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                This permanently removes the event and every registration tied to it.
                There&rsquo;s no undo.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setConfirmOpen(false)}
                  disabled={isPending}
                  className="flex-1 rounded-full bg-ink/[0.06] px-4 py-3 text-sm font-bold text-ink ring-1 ring-ink/10 transition-colors hover:bg-ink/10"
                >
                  Keep it
                </button>
                <button
                  onClick={doDelete}
                  disabled={isPending}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700",
                    isPending && "opacity-70"
                  )}
                >
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  {isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
