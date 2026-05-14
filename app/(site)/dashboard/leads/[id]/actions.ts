"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/db";
import { leads, orders, orderUpdates, users } from "@/db/schema";
import type { LeadStatus } from "@/db/schema";

const VALID_TARGET_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "archived",
];

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

export async function updateLeadStatusAction(formData: FormData) {
  await requireOwner();
  const id = (formData.get("id") as string | null)?.trim();
  const status = formData.get("status") as string | null;
  if (!id || !status) return;
  if (!(VALID_TARGET_STATUSES as string[]).includes(status)) return;

  const db = getDb();
  await db
    .update(leads)
    .set({ status: status as LeadStatus })
    .where(eq(leads.id, id));

  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${id}`);
  revalidatePath("/dashboard");
}

export type ConvertLeadState = {
  error?: string;
};

function pickString(
  payload: Record<string, unknown> | null,
  key: string,
): string | null {
  if (!payload) return null;
  const v = payload[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function pickNumber(
  payload: Record<string, unknown> | null,
  key: string,
): number | null {
  if (!payload) return null;
  const v = payload[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export async function convertLeadAction(
  _prev: ConvertLeadState,
  formData: FormData,
): Promise<ConvertLeadState> {
  const session = await requireOwner();
  const leadId = (formData.get("id") as string | null)?.trim();
  if (!leadId) return { error: "Missing lead id." };

  const db = getDb();
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);

  if (!lead) return { error: "Lead not found." };
  if (lead.status === "converted" && lead.convertedOrderId) {
    redirect(`/dashboard/orders/${lead.convertedOrderId}`);
  }

  // Reuse an existing user if the email already maps to one; otherwise spin
  // up a fresh client with a generated password (owner can reset later).
  const email = lead.email.toLowerCase();
  let userId: string;
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    userId = existing.id;
  } else {
    const passwordHash = await bcrypt.hash(generatePassword(), 10);
    const [created] = await db
      .insert(users)
      .values({
        email,
        name: lead.name,
        passwordHash,
        role: "client",
      })
      .returning({ id: users.id });
    userId = created.id;
  }

  const payload = (lead.payload ?? null) as Record<string, unknown> | null;
  const projectType = pickString(payload, "project-type");
  const message = pickString(payload, "message");
  const existingSite = pickString(payload, "existing-website");
  const budget = pickString(payload, "budget");
  const timeline = pickString(payload, "timeline");
  const estimatorTotal = pickNumber(payload, "total");

  const title =
    lead.source === "estimator"
      ? `Estimator quote — ${lead.name || lead.email}`
      : projectType
        ? `${projectType} — ${lead.name || lead.email}`
        : `New project — ${lead.name || lead.email}`;

  const descriptionParts: string[] = [];
  if (message) descriptionParts.push(message);
  const meta: string[] = [];
  if (existingSite) meta.push(`Existing site: ${existingSite}`);
  if (budget) meta.push(`Budget: ${budget}`);
  if (timeline) meta.push(`Timeline: ${timeline}`);
  if (meta.length) descriptionParts.push(meta.join("\n"));
  const description = descriptionParts.join("\n\n") || null;

  // Estimator submissions carry a dollar total; use it as the order total
  // so the owner doesn't have to retype the quote.
  const totalCents =
    lead.source === "estimator" && estimatorTotal !== null
      ? Math.round(estimatorTotal * 100)
      : 0;

  const [order] = await db
    .insert(orders)
    .values({
      title,
      description,
      status: "new",
      totalCents,
      clientId: userId,
    })
    .returning({ id: orders.id });

  await db.insert(orderUpdates).values({
    orderId: order.id,
    message: `Order created from lead (${lead.source}).`,
    statusChangedTo: "new",
    createdBy: session.user.id,
    isInternal: false,
  });

  await db
    .update(leads)
    .set({ status: "converted", convertedOrderId: order.id })
    .where(eq(leads.id, leadId));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/orders");
  redirect(`/dashboard/orders/${order.id}`);
}
