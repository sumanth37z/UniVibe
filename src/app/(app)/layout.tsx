import { Sidebar } from "@/components/sidebar";
import { getCurrentUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guests are welcome here: discovery routes render signed-out.
  // Protected pages (dashboard, my-events, registrations, profile…)
  // enforce auth themselves via requireUser().
  const user = await getCurrentUser();
  return (
    <div className="min-h-dvh">
      <Sidebar user={user} />
      <main className="min-h-dvh lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          {children}
        </div>
      </main>
    </div>
  );
}
