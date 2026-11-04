import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth-forms";
import { DbSetupNotice } from "@/components/db-setup";
import { getCurrentUser } from "@/lib/auth";
import { getAllColleges } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const nextPath =
    typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//")
      ? sp.next
      : "/dashboard";

  const user = await getCurrentUser();
  if (user) redirect(nextPath);
  let colleges;
  try {
    colleges = await getAllColleges();
  } catch (err) {
    console.error("[signup] colleges load failed:", err);
    return <div className="lg:col-span-2"><DbSetupNotice /></div>;
  }
  return <SignupForm colleges={colleges} nextPath={nextPath} />;
}
