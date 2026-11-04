"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { colleges, users } from "@/db/schema";
import { hashPassword, requireUser, verifyPassword } from "@/lib/auth";

export type ProfileFormState = { error?: string; success?: string } | null;

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters").max(120),
  bio: z.string().trim().max(400).optional(),
  collegeId: z.string().uuid("Pick your college"),
});

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
    collegeId: formData.get("collegeId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const exists = await db
    .select({ id: colleges.id })
    .from(colleges)
    .where(eq(colleges.id, parsed.data.collegeId))
    .limit(1);
  if (exists.length === 0) return { error: "Pick a valid college" };

  await db
    .update(users)
    .set({
      name: parsed.data.name,
      bio: parsed.data.bio || null,
      collegeId: parsed.data.collegeId,
    })
    .where(eq(users.id, user.id));

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: "Profile updated" };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z.string().min(6, "New password needs at least 6 characters").max(100),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export async function changePassword(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  const record = rows[0];
  if (!record || !(await verifyPassword(parsed.data.current, record.passwordHash))) {
    return { error: "Current password is wrong" };
  }

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(parsed.data.next) })
    .where(eq(users.id, user.id));
  return { success: "Password changed" };
}
