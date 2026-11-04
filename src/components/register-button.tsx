"use client";

import { useOptimistic, useTransition } from "react";
import { CheckCircle2, Loader2, Ticket, XCircle } from "lucide-react";
import { toast } from "sonner";

import { cancelRegistration, registerForEvent } from "@/lib/actions/registrations";
import { cn } from "@/lib/utils";

export function RegisterButton({
  eventId,
  isRegistered,
  disabled,
  disabledReason,
  fullWidth = true,
}: {
  eventId: string;
  isRegistered: boolean;
  disabled: boolean;
  disabledReason?: string;
  fullWidth?: boolean;
}) {
  const [optimisticRegistered, setOptimisticRegistered] = useOptimistic(isRegistered);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      setOptimisticRegistered(!optimisticRegistered);
      const result = optimisticRegistered
        ? await cancelRegistration(eventId)
        : await registerForEvent(eventId);
      if (result.ok) {
        toast.success(result.message ?? (optimisticRegistered ? "Cancelled" : "You're in!"));
      } else {
        toast.error(result.error);
      }
    });
  }

  if (disabled && !isRegistered && !optimisticRegistered) {
    return (
      <button
        disabled
        className={cn(
          "inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full bg-ink/10 px-7 py-3.5 text-sm font-bold text-ink-3",
          fullWidth && "w-full"
        )}
      >
        {disabledReason ?? "Registration closed"}
      </button>
    );
  }

  const active = optimisticRegistered;

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold transition-all duration-200 disabled:opacity-60",
        fullWidth && "w-full",
        active
          ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/30 hover:bg-red-50 hover:text-red-700 hover:ring-red-300"
          : "bg-ink text-cream hover:scale-[1.02] hover:bg-iris"
      )}
    >
      {isPending ? (
        <Loader2 className="size-4.5 animate-spin" />
      ) : active ? (
        <>
          <CheckCircle2 className="size-4.5 group-hover:hidden" />
          <XCircle className="hidden size-4.5 group-hover:block" />
        </>
      ) : (
        <Ticket className="size-4.5 transition-transform duration-300 group-hover:-rotate-12" />
      )}
      {isPending
        ? active
          ? "Cancelling…"
          : "Reserving…"
        : active
          ? "Registered"
          : "Register now"}
      {active && !isPending && (
        <span className="text-xs font-semibold opacity-70 group-hover:hidden">
          · tap to cancel
        </span>
      )}
    </button>
  );
}
