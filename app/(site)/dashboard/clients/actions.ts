"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/db";
import { users } from "@/db/schema";

export type CreateClientState = {
  error?: string;
  // Returned ONCE after successful creation so the owner can copy the temp
  // password to share with the client out-of-band (no email infra yet).
  generatedPassword?: string;
  createdEmail?: string;
};

function generatePassword(length = 16): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  // base64url-safe: no padding, no slashes
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
    .slice(0, length);
}

export async function createClientAction(
  _prev: CreateClientState,
  formData: FormData,
): Promise<CreateClientState> {
  await requireOwner();

  const email = (formData.get("email") as string | null)
    ?.trim()
    .toLowerCase();
  const name = (formData.get("name") as string | null)?.trim();
  const passwordRaw = (formData.get("password") as string | null)?.trim();

  if (!email) return { error: "Email is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email looks malformed." };
  }
  if (passwordRaw && passwordRaw.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { error: "A user with that email already exists." };
  }

  const password = passwordRaw || generatePassword();
  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    email,
    name: name || null,
    passwordHash,
    role: "client",
  });

  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard");
  return { generatedPassword: password, createdEmail: email };
}
