"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb } from "@/db";
import { leads, orders, orderItems, orderUpdates, users } from "@/db/schema";
import type { QuoteData } from "@/db/schema";

export type AcceptQuoteState = {
  error?: string;
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

export async function acceptQuoteAction(
  token: string,
  _prev: AcceptQuoteState,
  _formData: FormData,
): Promise<AcceptQuoteState> {
  if (!token) return { error: "Invalid quote link." };

  const db = getDb();
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.quoteToken, token))
    .limit(1);

  if (!lead || !lead.quoteData) {
    return { error: "Quote not found." };
  }

  if (lead.quoteAcceptedAt && lead.convertedOrderId) {
    // Idempotent: already accepted. Send them to the thank-you page.
    redirect(`/quote/${token}/accepted`);
  }

  const quote = lead.quoteData as QuoteData;

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

  const [order] = await db
    .insert(orders)
    .values({
      title: quote.title,
      description: quote.description || null,
      status: "new",
      totalCents: quote.totalCents,
      clientId: userId,
    })
    .returning({ id: orders.id });

  if (quote.items.length > 0) {
    await db.insert(orderItems).values(
      quote.items.map((it, idx) => ({
        orderId: order.id,
        description: it.description,
        quantity: it.quantity,
        unitPriceCents: it.unitPriceCents,
        position: idx,
      })),
    );
  }

  await db.insert(orderUpdates).values({
    orderId: order.id,
    message: "Quote accepted by client.",
    statusChangedTo: "new",
    createdBy: userId,
    isInternal: false,
  });

  await db
    .update(leads)
    .set({
      status: "converted",
      convertedOrderId: order.id,
      quoteAcceptedAt: new Date(),
    })
    .where(eq(leads.id, lead.id));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/orders");
  redirect(`/quote/${token}/accepted`);
}
