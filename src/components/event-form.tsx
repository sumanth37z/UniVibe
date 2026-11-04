"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CalendarPlus, Loader2 } from "lucide-react";

import { createEvent, updateEvent, type EventFormState } from "@/lib/actions/events";
import { CATEGORIES, MODES } from "@/lib/constants";
import { cn, toDatetimeLocal } from "@/lib/utils";
import type { Event } from "@/db/schema";

const input =
  "w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm font-medium text-ink placeholder:text-ink-3/60 transition-colors focus:border-iris focus:outline-none";
const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-2";

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelCls}>{label}</label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function Submit({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-bold text-cream transition-all duration-200 hover:scale-[1.02] hover:bg-iris disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <CalendarPlus className="size-4.5" />
      )}
      {pending ? "Saving…" : isEdit ? "Save changes" : "Create event"}
    </button>
  );
}

export function EventForm({
  event,
  hostName,
}: {
  event?: Event;
  hostName: string;
}) {
  const isEdit = !!event;
  const action = isEdit ? updateEvent.bind(null, event.id) : createEvent;
  const [state, formAction] = useActionState<EventFormState, FormData>(action, null);
  const err = (field: string) => (state?.field === field ? state.error : undefined);

  const now = new Date();
  const defaults = {
    startsAt: event ? toDatetimeLocal(event.startsAt) : toDatetimeLocal(new Date(now.getTime() + 14 * 86400000)),
    endsAt: event ? toDatetimeLocal(event.endsAt) : toDatetimeLocal(new Date(now.getTime() + 14 * 86400000 + 3 * 3600000)),
    registrationDeadline: event ? toDatetimeLocal(event.registrationDeadline) : toDatetimeLocal(new Date(now.getTime() + 12 * 86400000)),
  };

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && !state.field && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      )}

      <div className="rounded-3xl bg-cream p-6 ring-1 ring-ink/10 sm:p-8">
        <h2 className="font-display text-lg font-bold tracking-tight">The essentials</h2>
        <p className="mt-1 text-sm text-ink-3">
          Publishing under <span className="font-bold text-ink">{hostName}</span> — visible to every campus.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Event title" error={err("title")} className="sm:col-span-2">
            <input name="title" required maxLength={160} defaultValue={event?.title} placeholder="e.g. CodeSprint 6.0 — 24h National Hackathon" className={input} />
          </Field>
          <Field label="Tagline" error={err("tagline")} className="sm:col-span-2">
            <input name="tagline" maxLength={200} defaultValue={event?.tagline} placeholder="One line that sells the vibe" className={input} />
          </Field>
          <Field label="Category" error={err("category")}>
            <select name="category" defaultValue={event?.category ?? "hackathon"} className={input}>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Mode" error={err("mode")}>
            <select name="mode" defaultValue={event?.mode ?? "in_person"} className={input}>
              {MODES.map((m) => (
                <option key={m.slug} value={m.slug}>{m.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Venue" error={err("venue")}>
            <input name="venue" required maxLength={180} defaultValue={event?.venue} placeholder="Main Auditorium, Block C" className={input} />
          </Field>
          <Field label="City" error={err("city")}>
            <input name="city" required maxLength={80} defaultValue={event?.city} placeholder="Bengaluru" className={input} />
          </Field>
          <Field label="Online link (optional, for online/hybrid)" error={err("onlineLink")} className="sm:col-span-2">
            <input name="onlineLink" type="url" maxLength={240} defaultValue={event?.onlineLink ?? ""} placeholder="https://meet.google.com/…" className={input} />
          </Field>
        </div>
      </div>

      <div className="rounded-3xl bg-cream p-6 ring-1 ring-ink/10 sm:p-8">
        <h2 className="font-display text-lg font-bold tracking-tight">Schedule & logistics</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="Starts" error={err("startsAt")}>
            <input name="startsAt" type="datetime-local" required defaultValue={defaults.startsAt} className={input} />
          </Field>
          <Field label="Ends" error={err("endsAt")}>
            <input name="endsAt" type="datetime-local" required defaultValue={defaults.endsAt} className={input} />
          </Field>
          <Field label="Registration deadline" error={err("registrationDeadline")}>
            <input name="registrationDeadline" type="datetime-local" required defaultValue={defaults.registrationDeadline} className={input} />
          </Field>
          <Field label="Capacity" error={err("capacity")}>
            <input name="capacity" type="number" min={1} max={100000} required defaultValue={event?.capacity ?? 100} className={input} />
          </Field>
          <Field label="Entry fee (₹, 0 = free)" error={err("feeInr")}>
            <input name="feeInr" type="number" min={0} required defaultValue={event?.feeInr ?? 0} className={input} />
          </Field>
          <Field label="Prize pool (optional)" error={err("prizePool")}>
            <input name="prizePool" maxLength={120} defaultValue={event?.prizePool ?? ""} placeholder="₹1,00,000 + goodies" className={input} />
          </Field>
          <Field label="Min team size" error={err("teamSizeMin")}>
            <input name="teamSizeMin" type="number" min={1} max={20} required defaultValue={event?.teamSizeMin ?? 1} className={input} />
          </Field>
          <Field label="Max team size" error={err("teamSizeMax")}>
            <input name="teamSizeMax" type="number" min={1} max={20} required defaultValue={event?.teamSizeMax ?? 1} className={input} />
          </Field>
          <Field label="Tags (comma separated)" error={err("tags")}>
            <input name="tags" maxLength={300} defaultValue={event?.tags.join(", ")} placeholder="ai, web3, react" className={input} />
          </Field>
        </div>
      </div>

      <div className="rounded-3xl bg-cream p-6 ring-1 ring-ink/10 sm:p-8">
        <h2 className="font-display text-lg font-bold tracking-tight">Tell the story</h2>
        <div className="mt-5 space-y-4">
          <Field label="Description (min 20 characters)" error={err("description")}>
            <textarea name="description" required minLength={20} rows={7} defaultValue={event?.description} placeholder="What happens, who should come, what to bring, rules, perks…" className={cn(input, "resize-y")} />
          </Field>
          <Field label="Visibility" error={err("status")}>
            <div className="flex flex-wrap gap-3">
              {[
                { v: "published", label: "Published — live for everyone" },
                { v: "draft", label: "Draft — only you can see" },
              ].map((o) => (
                <label key={o.v} className="cursor-pointer">
                  <input type="radio" name="status" value={o.v} defaultChecked={(event?.status ?? "published") === o.v || (event?.status === "cancelled" && o.v === "published")} className="peer sr-only" />
                  <span className="inline-block rounded-full border border-line bg-cream px-5 py-2.5 text-sm font-bold text-ink-2 transition-all peer-checked:border-iris peer-checked:bg-iris/10 peer-checked:text-iris peer-checked:ring-2 peer-checked:ring-iris/30">
                    {o.label}
                  </span>
                </label>
              ))}
            </div>
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Submit isEdit={isEdit} />
        <p className="text-xs font-medium text-ink-3">
          You can edit or unpublish anytime from Manage events.
        </p>
      </div>
    </form>
  );
}
