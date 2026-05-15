"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAuth, requireOwner } from "@/lib/auth";
import { getDb } from "@/db";
import { orders, orderUpdates, users } from "@/db/schema";
import type { OrderStatus } from "@/db/schema";
import { createReviewRequest } from "@/lib/reviews";

export type UpdateState = { error?: string; success?: boolean };
export type EditOrderState = { error?: string; success?: boolean };

const VALID_STATUSES: OrderStatus[] = [
  "new",
  "in_progress",
  "review",
  "completed",
  "on_hold",
  "cancelled",
];

function parseStatus(raw: FormDataEntryValue | null): OrderStatus | null {
  if (typeof raw === "string" && (VALID_STATUSES as string[]).includes(raw)) {
    return raw as OrderStatus;
  }
  return null;
}

function parseDollarsToCents(raw: FormDataEntryValue | null): number {
  if (typeof raw !== "string" || raw.trim() === "") return 0;
  const n = Number(raw.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

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

export async function updateOrderAction(
  orderId: string,
  _prev: EditOrderState,
  formData: FormData,
): Promise<EditOrderState> {
  const session = await requireOwner();

  const title = (formData.get("title") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim();
  const clientId = (formData.get("clientId") as string | null)?.trim();
  const status = parseStatus(formData.get("status"));
  const totalCents = parseDollarsToCents(formData.get("total"));
  const dueDateRaw = (formData.get("dueDate") as string | null)?.trim();
  const notes = (formData.get("notes") as string | null)?.trim();

  if (!title) return { error: "Title is required." };
  if (!clientId) return { error: "Pick a client." };
  if (!status) return { error: "Status is invalid." };

  const dueDate = dueDateRaw ? new Date(dueDateRaw) : null;
  if (dueDate && Number.isNaN(dueDate.getTime())) {
    return { error: "Due date is invalid." };
  }

  const db = getDb();

  const [existing] = await db
    .select({ status: orders.status })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!existing) return { error: "Order not found." };

  // Confirm assigned user is actually a client.
  const [client] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, clientId))
    .limit(1);
  if (!client || client.role !== "client") {
    return { error: "Selected client doesn't exist." };
  }

  await db
    .update(orders)
    .set({
      title,
      description: description || null,
      status,
      totalCents,
      dueDate,
      notes: notes || null,
      clientId,
    })
    .where(eq(orders.id, orderId));

  // Record a timeline entry. If status moved, mark the change; otherwise
  // it's just an "edited" note (internal so the client doesn't see boring
  // bookkeeping).
  const statusMoved = existing.status !== status;
  await db.insert(orderUpdates).values({
    orderId,
    message: statusMoved ? "Order details updated." : "Order details edited.",
    statusChangedTo: statusMoved ? status : null,
    createdBy: session.user.id,
    isInternal: !statusMoved,
  });

  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createReviewRequestAction(formData: FormData) {
  await requireOwner();
  const orderId = (formData.get("orderId") as string | null)?.trim();
  if (!orderId) return;
  await createReviewRequest(orderId);
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/dashboard/reviews");
}

export async function deleteOrderAction(
  orderId: string,
): Promise<{ error?: string }> {
  await requireOwner();

  const db = getDb();
  const [existing] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!existing) return { error: "Order not found." };

  // orderItems + orderUpdates have onDelete: cascade, so this wipes the
  // whole order trail in one shot.
  await db.delete(orders).where(eq(orders.id, orderId));

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
  redirect("/dashboard/orders");
}
