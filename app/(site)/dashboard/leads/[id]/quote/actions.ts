"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/db";
import { leads } from "@/db/schema";
import type { QuoteData, QuoteLineItem } from "@/db/schema";

export type QuoteFormState = {
  error?: string;
  success?: boolean;
};

function generateToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function saveQuoteAction(
  leadId: string,
  _prev: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  await requireOwner();

  const title = (formData.get("title") as string | null)?.trim();
  if (!title) return { error: "Title is required." };
  if (title.length > 200) return { error: "Title is too long." };

  const description =
    (formData.get("description") as string | null)?.trim() || undefined;

  const descriptions = formData.getAll("item-description") as string[];
  const quantities = formData.getAll("item-quantity") as string[];
  const prices = formData.getAll("item-price") as string[];

  const items: QuoteLineItem[] = [];
  for (let i = 0; i < descriptions.length; i++) {
    const desc = (descriptions[i] || "").trim();
    if (!desc) continue;
    const qty = parseInt(quantities[i] || "1", 10);
    const priceDollars = parseFloat(prices[i] || "0");
    if (!Number.isFinite(qty) || qty < 1) {
      return { error: `Bad quantity on line ${i + 1}.` };
    }
    if (!Number.isFinite(priceDollars) || priceDollars < 0) {
      return { error: `Bad price on line ${i + 1}.` };
    }
    items.push({
      description: desc,
      quantity: qty,
      unitPriceCents: Math.round(priceDollars * 100),
    });
  }

  if (items.length === 0) {
    return { error: "Add at least one line item." };
  }

  const totalCents = items.reduce(
    (sum, it) => sum + it.quantity * it.unitPriceCents,
    0,
  );

  const quoteData: QuoteData = { title, description, items, totalCents };

  const db = getDb();
  const [existing] = await db
    .select({ token: leads.quoteToken })
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);

  if (!existing) return { error: "Lead not found." };

  const token = existing.token ?? generateToken();

  await db
    .update(leads)
    .set({
      quoteData,
      quoteToken: token,
      quoteSentAt: new Date(),
    })
    .where(eq(leads.id, leadId));

  revalidatePath(`/dashboard/leads/${leadId}`);
  revalidatePath(`/dashboard/leads/${leadId}/quote`);
  redirect(`/dashboard/leads/${leadId}`);
}
