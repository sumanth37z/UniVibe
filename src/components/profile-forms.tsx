"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2 } from "lucide-react";

import {
  changePassword,
  updateProfile,
  type ProfileFormState,
} from "@/lib/actions/profile";
import { cn } from "@/lib/utils";

const input =
  "w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm font-medium text-ink placeholder:text-ink-3/60 transition-colors focus:border-iris focus:outline-none";
const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-2";

function Note({ state }: { state: ProfileFormState }) {
  if (!state) return null;
  if (state.error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {state.error}
      </div>
    );
  }
  if (state.success) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
        <CheckCircle2 className="size-4" />
        {state.success}
      </div>
    );
  }
  return null;
}

function Save({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-cream transition-all duration-200 hover:scale-[1.02] hover:bg-iris disabled:opacity-60 disabled:hover:scale-100"
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Saving…" : label}
    </button>
  );
}

export function ProfileForm({
  user,
  colleges,
}: {
  user: { name: string; bio: string | null; collegeId: string };
  colleges: { id: string; name: string; shortName: string; city: string }[];
}) {
  const [state, formAction] = useActionState<ProfileFormState, FormData>(updateProfile, null);

  return (
    <form action={formAction} className="space-y-4">
      <Note state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Full name</label>
          <input name="name" required minLength={2} defaultValue={user.name} className={input} />
        </div>
        <div>
          <label className={labelCls}>College</label>
          <select name="collegeId" defaultValue={user.collegeId} className={input}>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortName} — {c.city}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Bio</label>
        <textarea
          name="bio"
          rows={4}
          maxLength={400}
          defaultValue={user.bio ?? ""}
          placeholder="What do you build, play or perform? Show up on your tickets with a line about you."
          className={cn(input, "resize-y")}
        />
      </div>
      <Save label="Save profile" />
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState<ProfileFormState, FormData>(changePassword, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.success) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-4">
      <Note state={state} />
      <div>
        <label className={labelCls}>Current password</label>
        <input name="current" type="password" required autoComplete="current-password" className={input} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>New password</label>
          <input name="next" type="password" required minLength={6} autoComplete="new-password" className={input} />
        </div>
        <div>
          <label className={labelCls}>Confirm new password</label>
          <input name="confirm" type="password" required minLength={6} autoComplete="new-password" className={input} />
        </div>
      </div>
      <Save label="Change password" />
    </form>
  );
}
