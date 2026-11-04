"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { colleges, users } from "@/db/schema";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(6, "Password needs at least 6 characters").max(100),
  role: z.enum(["student", "organizer"]),
  collegeId: z.string().uuid("Pick your college"),
});

export type AuthFormState = { error?: string; field?: string } | null;

/** Only allow same-site relative paths — blocks open redirects. */
function safeNext(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string") return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export async function signup(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    collegeId: formData.get("collegeId"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue.message, field: String(issue.path[0] ?? "") };
  }
  const { name, email, password, role, collegeId } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(sql`lower(${users.email})`, email))
    .limit(1);
  if (existing.length > 0) {
    return { error: "An account with this email already exists", field: "email" };
  }

  const college = await db
    .select({ id: colleges.id })
    .from(colleges)
    .where(eq(colleges.id, collegeId))
    .limit(1);
  if (college.length === 0) {
    return { error: "Pick a valid college", field: "collegeId" };
  }

  const passwordHash = await hashPassword(password);
  const hue = Math.floor(Math.random() * 360);
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash, role, collegeId, hue })
    .returning({ id: users.id });

  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export async function login(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue.message, field: String(issue.path[0] ?? "") };
  }
  const { email, password } = parsed.data;

  const rows = await db
    .select()
    .from(users)
    .where(eq(sql`lower(${users.email})`, email))
    .limit(1);
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Wrong email or password", field: "password" };
  }

  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
