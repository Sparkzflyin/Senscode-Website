"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAuth, requireOwner } from "@/lib/auth";
import { getDb } from "@/db";
import { orders, orderUpdates } from "@/db/schema";
import type { OrderStatus } from "@/db/schema";

export type UpdateState = { error?: string; success?: boolean };

const VALID_STATUSES: OrderStatus[] = [
  "new",
  "in_progress",
  "review",
  "completed",
  "on_hold",
  "cancelled",
];

export async function postUpdateAction(
  orderId: string,
  _prev: UpdateState,
  formData: FormData,
): Promise<UpdateState> {
  const session = await requireOwner();

  const message = (formData.get("message") as string | null)?.trim();
  const newStatus = formData.get("status") as string | null;
  const isInternal = formData.get("internal") === "on";

  if (!message) return { error: "Message can't be empty." };

  const statusChange =
    newStatus && (VALID_STATUSES as string[]).includes(newStatus)
      ? (newStatus as OrderStatus)
      : null;

  const db = getDb();

  if (statusChange) {
    await db
      .update(orders)
      .set({ status: statusChange })
      .where(eq(orders.id, orderId));
  }

  await db.insert(orderUpdates).values({
    orderId,
    message,
    statusChangedTo: statusChange,
    createdBy: session.user.id,
    isInternal,
  });

  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function postClientMessageAction(
  orderId: string,
  _prev: UpdateState,
  formData: FormData,
): Promise<UpdateState> {
  // Clients can post a public update on their own order.
  const session = await requireAuth();
  if (session.user.role !== "client") {
    return { error: "Only clients can post messages this way." };
  }

  const message = (formData.get("message") as string | null)?.trim();
  if (!message) return { error: "Message can't be empty." };

  const db = getDb();
  // Verify ownership: this client must own this order.
  const [order] = await db
    .select({ clientId: orders.clientId })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order || order.clientId !== session.user.id) {
    return { error: "Not your order." };
  }

  await db.insert(orderUpdates).values({
    orderId,
    message,
    statusChangedTo: null,
    createdBy: session.user.id,
    isInternal: false,
  });

  revalidatePath(`/dashboard/orders/${orderId}`);
  return { success: true };
}
