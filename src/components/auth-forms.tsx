"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowRight, GraduationCap, Loader2, Megaphone } from "lucide-react";

import { login, signup, type AuthFormState } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

function fieldClass(invalid?: boolean) {
  return cn(
    "w-full rounded-xl border bg-cream px-4 py-3 text-sm font-medium text-ink placeholder:text-ink-3/70 transition-colors focus:border-iris focus:outline-none",
    invalid ? "border-red-400" : "border-line hover:border-ink/25"
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-cream transition-all duration-200 hover:scale-[1.015] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Hold on…
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}

function ErrorNote({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {error}
    </div>
  );
}

export function LoginForm({
  demo,
  nextPath = "/dashboard",
}: {
  demo: { email: string; label: string }[];
  nextPath?: string;
}) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(login, null);

  return (
    <div>
      <h1 className="font-display text-4xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-ink-2">
        New here?{" "}
        <Link href="/signup" className="font-bold text-iris underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-6 rounded-2xl border border-dashed border-ink/20 bg-cream/60 p-3">
        <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-ink-3">
          Try the demo instantly
        </p>
        <div className="flex flex-wrap gap-2">
          {demo.map((d) => (
            <form key={d.email} action={formAction}>
              <input type="hidden" name="email" value={d.email} />
              <input type="hidden" name="password" value="password123" />
              <input type="hidden" name="next" value={nextPath} />
              <DemoButton label={d.label} />
            </form>
          ))}
        </div>
      </div>

      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="next" value={nextPath} />
        <ErrorNote error={state?.error && !state.field ? state.error : undefined} />
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@college.edu"
            className={fieldClass(state?.field === "email")}
          />
          {state?.field === "email" && (
            <p className="mt-1 text-xs font-medium text-red-600">{state.error}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={fieldClass(state?.field === "password")}
          />
          {state?.field === "password" && (
            <p className="mt-1 text-xs font-medium text-red-600">{state.error}</p>
          )}
        </div>
        <SubmitButton label="Sign in" />
      </form>
    </div>
  );
}

function DemoButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-cream transition-all duration-200 hover:bg-iris disabled:opacity-50"
    >
      {label}
    </button>
  );
}

export function SignupForm({
  colleges,
  nextPath = "/dashboard",
}: {
  colleges: { id: string; name: string; shortName: string; city: string }[];
  nextPath?: string;
}) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(signup, null);

  return (
    <div>
      <h1 className="font-display text-4xl font-bold tracking-tight">Claim your seat</h1>
      <p className="mt-2 text-sm text-ink-2">
        Already on univibe?{" "}
        <Link href="/login" className="font-bold text-iris underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>

      <form action={formAction} className="mt-7 space-y-4">
        <input type="hidden" name="next" value={nextPath} />
        <div
          role="radiogroup"
          aria-label="Account type"
          className="grid grid-cols-2 gap-3"
        >
          <label className="cursor-pointer">
            <input
              type="radio"
              name="role"
              value="student"
              defaultChecked
              className="peer sr-only"
            />
            <span className="flex flex-col gap-2 rounded-2xl border border-line bg-cream p-4 transition-all peer-checked:border-iris peer-checked:bg-iris/5 peer-checked:ring-2 peer-checked:ring-iris/30">
              <GraduationCap className="size-5 text-ink-2" />
              <span>
                <span className="block text-sm font-bold">Student</span>
                <span className="block text-xs text-ink-3">Discover & book seats</span>
              </span>
            </span>
          </label>
          <label className="cursor-pointer">
            <input type="radio" name="role" value="organizer" className="peer sr-only" />
            <span className="flex flex-col gap-2 rounded-2xl border border-line bg-cream p-4 transition-all peer-checked:border-iris peer-checked:bg-iris/5 peer-checked:ring-2 peer-checked:ring-iris/30">
              <Megaphone className="size-5 text-ink-2" />
              <span>
                <span className="block text-sm font-bold">Organizer</span>
                <span className="block text-xs text-ink-3">Publish events for your college</span>
              </span>
            </span>
          </label>
        </div>

        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-2">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            placeholder="Ada Sharma"
            className={fieldClass(state?.field === "name")}
          />
          {state?.field === "name" && (
            <p className="mt-1 text-xs font-medium text-red-600">{state.error}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@college.edu"
            className={fieldClass(state?.field === "email")}
          />
          {state?.field === "email" && (
            <p className="mt-1 text-xs font-medium text-red-600">{state.error}</p>
          )}
        </div>

        <div>
          <label htmlFor="collegeId" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-2">
            Your college
          </label>
          <select
            id="collegeId"
            name="collegeId"
            required
            defaultValue=""
            className={cn(fieldClass(state?.field === "collegeId"), "appearance-none")}
          >
            <option value="" disabled>
              Pick from the network
            </option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortName} — {c.city}
              </option>
            ))}
          </select>
          {state?.field === "collegeId" && (
            <p className="mt-1 text-xs font-medium text-red-600">{state.error}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className={fieldClass(state?.field === "password")}
          />
          {state?.field === "password" && (
            <p className="mt-1 text-xs font-medium text-red-600">{state.error}</p>
          )}
        </div>

        <ErrorNote error={state?.error && !state.field ? state.error : undefined} />
        <SubmitButton label="Create account" />
      </form>
    </div>
  );
}
