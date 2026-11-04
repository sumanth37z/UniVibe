import { KeyRound, UserRound } from "lucide-react";

import { Avatar } from "@/components/monogram";
import { PageHeader } from "@/components/page-header";
import { PasswordForm, ProfileForm } from "@/components/profile-forms";
import { Pill } from "@/components/badges";
import { requireUser } from "@/lib/auth";
import { getAllColleges } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const colleges = await getAllColleges();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        eyebrow="Your account"
        title="Profile & settings"
        description="How you appear on tickets and attendee lists across the network."
      />

      {/* identity card */}
      <div className="relative overflow-hidden rounded-3xl bg-ink p-7 text-cream sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-iris/40 blur-3xl"
        />
        <div className="relative flex flex-wrap items-center gap-5">
          <Avatar name={user.name} hue={user.hue} className="size-16 text-xl ring-2 ring-cream/20" />
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-2xl font-bold tracking-tight">{user.name}</h2>
              <Pill className="bg-cream/10 text-cream ring-cream/20">
                {user.role === "organizer" ? "Organizer" : "Student"}
              </Pill>
            </div>
            <p className="mt-1 text-sm font-medium text-cream/60">{user.email}</p>
            <p className="text-sm font-medium text-cream/60">
              {user.college.name} · {user.college.city}
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-3xl bg-cream p-6 ring-1 ring-ink/10 sm:p-8">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <UserRound className="size-5 text-iris" />
          About you
        </h3>
        <div className="mt-5">
          <ProfileForm
            user={{ name: user.name, bio: user.bio, collegeId: user.collegeId }}
            colleges={colleges}
          />
        </div>
      </section>

      <section className="rounded-3xl bg-cream p-6 ring-1 ring-ink/10 sm:p-8">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <KeyRound className="size-5 text-iris" />
          Security
        </h3>
        <div className="mt-5">
          <PasswordForm />
        </div>
      </section>
    </div>
  );
}
