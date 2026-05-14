import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { leads } from "@/db/schema";
import type { Lead, LeadStatus } from "@/db/schema";

export type LeadListRow = Pick<
  Lead,
  | "id"
  | "name"
  | "email"
  | "source"
  | "status"
  | "createdAt"
  | "convertedOrderId"
>;

export async function listLeads(): Promise<LeadListRow[]> {
  const db = getDb();
  return db
    .select({
      id: leads.id,
      name: leads.name,
      email: leads.email,
      source: leads.source,
      status: leads.status,
      createdAt: leads.createdAt,
      convertedOrderId: leads.convertedOrderId,
    })
    .from(leads)
    .orderBy(desc(leads.createdAt));
}

export async function getLead(id: string): Promise<Lead | null> {
  const db = getDb();
  const [row] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return row ?? null;
}

export async function countNewLeads(): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(leads)
    .where(eq(leads.status, "new"));
  return row?.count ?? 0;
}

export function leadStatusLabel(status: LeadStatus): string {
  switch (status) {
    case "new":
      return "New";
    case "contacted":
      return "Contacted";
    case "converted":
      return "Converted";
    case "archived":
      return "Archived";
  }
}
