"use server";

import { revalidatePath } from "next/cache";
import { inArray } from "drizzle-orm";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/db";
import { leads } from "@/db/schema";

export type BulkActionState = {
  error?: string;
  success?: string;
};

function readIds(formData: FormData): string[] {
  return formData
    .getAll("id")
    .filter((v): v is string => typeof v === "string" && v.length > 0);
}

export async function bulkArchiveLeadsAction(
  _prev: BulkActionState,
  formData: FormData,
): Promise<BulkActionState> {
  await requireOwner();
  const ids = readIds(formData);
  if (ids.length === 0) return { error: "Pick at least one lead." };

  const db = getDb();
  await db
    .update(leads)
    .set({ status: "archived" })
    .where(inArray(leads.id, ids));

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
  return { success: `Archived ${ids.length} lead${ids.length === 1 ? "" : "s"}.` };
}

export async function bulkDeleteLeadsAction(
  _prev: BulkActionState,
  formData: FormData,
): Promise<BulkActionState> {
  await requireOwner();
  const ids = readIds(formData);
  if (ids.length === 0) return { error: "Pick at least one lead." };

  const db = getDb();
  await db.delete(leads).where(inArray(leads.id, ids));

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
  return { success: `Deleted ${ids.length} lead${ids.length === 1 ? "" : "s"}.` };
}
