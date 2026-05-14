"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { and, eq, ne } from "drizzle-orm";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/db";
import { orders, users } from "@/db/schema";

export type UpdateClientState = {
  error?: string;
  success?: boolean;
  // Returned ONCE after a password reset so the owner can copy + share it.
  newPassword?: string;
};

function generatePassword(length = 16): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
    .slice(0, length);
}

export async function updateClientAction(
  clientId: string,
  _prev: UpdateClientState,
  formData: FormData,
): Promise<UpdateClientState> {
  await requireOwner();

  const email = (formData.get("email") as string | null)
    ?.trim()
    .toLowerCase();
  const name = (formData.get("name") as string | null)?.trim() || null;
  const passwordRaw = (formData.get("password") as string | null)?.trim();
  const resetPassword = formData.get("resetPassword") === "on";
  const canAuthorBlog = formData.get("canAuthorBlog") === "on";

  if (!email) return { error: "Email is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email looks malformed." };
  }
  if (passwordRaw && passwordRaw.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const db = getDb();

  // Confirm target is actually a client (don't let owner role get mutated here).
  const [target] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, clientId))
    .limit(1);
  if (!target || target.role !== "client") {
    return { error: "Client not found." };
  }

  // Email must remain unique (excluding this same row).
  const [collision] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), ne(users.id, clientId)))
    .limit(1);
  if (collision) return { error: "Another user already has that email." };

  let newPassword: string | undefined;
  let passwordHash: string | undefined;
  if (resetPassword) {
    newPassword = passwordRaw || generatePassword();
    passwordHash = await bcrypt.hash(newPassword, 10);
  } else if (passwordRaw) {
    passwordHash = await bcrypt.hash(passwordRaw, 10);
    newPassword = passwordRaw;
  }

  await db
    .update(users)
    .set({
      email,
      name,
      canAuthorBlog,
      ...(passwordHash ? { passwordHash } : {}),
    })
    .where(eq(users.id, clientId));

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${clientId}`);
  return { success: true, newPassword };
}

export async function deleteClientAction(
  clientId: string,
): Promise<{ error?: string }> {
  await requireOwner();

  const db = getDb();
  const [target] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, clientId))
    .limit(1);
  if (!target || target.role !== "client") {
    return { error: "Client not found." };
  }

  // Orders FK is onDelete: restrict — refuse with a useful message.
  const [hasOrder] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.clientId, clientId))
    .limit(1);
  if (hasOrder) {
    return {
      error:
        "This client still has orders. Delete or reassign their orders first, then try again.",
    };
  }

  await db.delete(users).where(eq(users.id, clientId));

  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard");
  redirect("/dashboard/clients");
}
