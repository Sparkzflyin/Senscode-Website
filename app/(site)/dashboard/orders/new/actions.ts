"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/db";
import { orders, orderUpdates } from "@/db/schema";
import type { OrderStatus } from "@/db/schema";

export type CreateOrderState = {
  error?: string;
};

const VALID_STATUSES: OrderStatus[] = [
  "new",
  "in_progress",
  "review",
  "completed",
  "on_hold",
  "cancelled",
];

function parseStatus(raw: FormDataEntryValue | null): OrderStatus {
  if (typeof raw === "string" && (VALID_STATUSES as string[]).includes(raw)) {
    return raw as OrderStatus;
  }
  return "new";
}

function parseDollarsToCents(raw: FormDataEntryValue | null): number {
  if (typeof raw !== "string" || raw.trim() === "") return 0;
  const n = Number(raw.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

export async function createOrderAction(
  _prev: CreateOrderState,
  formData: FormData,
): Promise<CreateOrderState> {
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

  const dueDate = dueDateRaw ? new Date(dueDateRaw) : null;
  if (dueDate && Number.isNaN(dueDate.getTime())) {
    return { error: "Due date is invalid." };
  }

  const db = getDb();
  const [created] = await db
    .insert(orders)
    .values({
      title,
      description: description || null,
      status,
      totalCents,
      dueDate,
      notes: notes || null,
      clientId,
    })
    .returning({ id: orders.id });

  await db.insert(orderUpdates).values({
    orderId: created.id,
    message: "Order created.",
    statusChangedTo: status,
    createdBy: session.user.id,
    isInternal: false,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  redirect(`/dashboard/orders/${created.id}`);
}
