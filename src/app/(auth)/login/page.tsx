import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await seedIfEmpty();
  const sp = await searchParams;
  const nextPath =
    typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//")
      ? sp.next
      : "/dashboard";

  const user = await getCurrentUser();
  if (user) redirect(nextPath);

  return (
    <LoginForm
      nextPath={nextPath}
      demo={[
        { email: "meera@nitt.in", label: "Demo student" },
        { email: "aarav@iitb.in", label: "Demo organizer" },
      ]}
    />
  );
}
