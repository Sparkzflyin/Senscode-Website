import { eq, sql, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { leads, orders, orderUpdates, users } from "@/db/schema";
import type {
  OrderStatus,
  LeadStatus,
  LeadSource,
} from "@/db/schema";

export type OwnerStats = {
  revenue: { lifetimeCents: number; thisMonthCents: number };
  ordersByStatus: Record<OrderStatus, number>;
  totalOrders: number;
  activeOrders: number;
  leadsByStatus: Record<LeadStatus, number>;
  leadsBySource: Record<LeadSource, number>;
  totalLeads: number;
  leadsThisMonth: number;
  totalClients: number;
  avgTimeToConversionDays: number | null;
  conversionRatePct: number | null;
};

const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "in_progress",
  "review",
  "completed",
  "on_hold",
  "cancelled",
];

const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "converted",
  "archived",
];

const LEAD_SOURCES: LeadSource[] = ["contact", "estimator"];

function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getOwnerStats(): Promise<OwnerStats> {
  const db = getDb();
  const monthStart = startOfMonth();

  const [
    [revenueRow],
    orderStatusRows,
    leadStatusRows,
    leadSourceRows,
    [clientCountRow],
    [leadsThisMonthRow],
    [conversionRow],
  ] = await Promise.all([
    db
      .select({
        lifetime: sql<number>`coalesce(sum(${orders.totalCents}) filter (where ${orders.status} = 'completed'), 0)::int`,
        thisMonth: sql<number>`coalesce(sum(${orders.totalCents}) filter (where ${orders.status} = 'completed' and ${orders.updatedAt} >= ${monthStart}), 0)::int`,
      })
      .from(orders),
    db
      .select({
        status: orders.status,
        count: sql<number>`count(*)::int`,
      })
      .from(orders)
      .groupBy(orders.status),
    db
      .select({
        status: leads.status,
        count: sql<number>`count(*)::int`,
      })
      .from(leads)
      .groupBy(leads.status),
    db
      .select({
        source: leads.source,
        count: sql<number>`count(*)::int`,
      })
      .from(leads)
      .groupBy(leads.source),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, "client")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(sql`${leads.createdAt} >= ${monthStart}`),
    db
      .select({
        avgSeconds: sql<
          number | null
        >`avg(extract(epoch from (${orders.createdAt} - ${leads.createdAt})))::float`,
      })
      .from(leads)
      .innerJoin(orders, eq(orders.id, leads.convertedOrderId))
      .where(eq(leads.status, "converted")),
  ]);

  const ordersByStatus = Object.fromEntries(
    ORDER_STATUSES.map((s) => [s, 0]),
  ) as Record<OrderStatus, number>;
  for (const row of orderStatusRows) {
    ordersByStatus[row.status] = row.count;
  }

  const leadsByStatus = Object.fromEntries(
    LEAD_STATUSES.map((s) => [s, 0]),
  ) as Record<LeadStatus, number>;
  for (const row of leadStatusRows) {
    leadsByStatus[row.status] = row.count;
  }

  const leadsBySource = Object.fromEntries(
    LEAD_SOURCES.map((s) => [s, 0]),
  ) as Record<LeadSource, number>;
  for (const row of leadSourceRows) {
    leadsBySource[row.source] = row.count;
  }

  const totalOrders =
    ordersByStatus.new +
    ordersByStatus.in_progress +
    ordersByStatus.review +
    ordersByStatus.completed +
    ordersByStatus.on_hold +
    ordersByStatus.cancelled;

  const activeOrders =
    ordersByStatus.new + ordersByStatus.in_progress + ordersByStatus.review;

  const totalLeads =
    leadsByStatus.new +
    leadsByStatus.contacted +
    leadsByStatus.converted +
    leadsByStatus.archived;

  const avgSeconds = conversionRow?.avgSeconds ?? null;
  const avgTimeToConversionDays =
    avgSeconds !== null ? avgSeconds / 86400 : null;

  const conversionRatePct =
    totalLeads > 0 ? (leadsByStatus.converted / totalLeads) * 100 : null;

  return {
    revenue: {
      lifetimeCents: revenueRow?.lifetime ?? 0,
      thisMonthCents: revenueRow?.thisMonth ?? 0,
    },
    ordersByStatus,
    totalOrders,
    activeOrders,
    leadsByStatus,
    leadsBySource,
    totalLeads,
    leadsThisMonth: leadsThisMonthRow?.count ?? 0,
    totalClients: clientCountRow?.count ?? 0,
    avgTimeToConversionDays,
    conversionRatePct,
  };
}

export type ActivityEntry =
  | {
      kind: "lead";
      id: string;
      at: Date;
      label: string;
      sub: string;
      href: string;
    }
  | {
      kind: "order";
      id: string;
      at: Date;
      label: string;
      sub: string;
      href: string;
    }
  | {
      kind: "update";
      id: string;
      at: Date;
      label: string;
      sub: string;
      href: string;
    };

export async function getRecentActivity(
  limit = 8,
): Promise<ActivityEntry[]> {
  const db = getDb();

  const [leadRows, orderRows, updateRows] = await Promise.all([
    db
      .select({
        id: leads.id,
        name: leads.name,
        email: leads.email,
        source: leads.source,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .orderBy(desc(leads.createdAt))
      .limit(limit),
    db
      .select({
        id: orders.id,
        title: orders.title,
        status: orders.status,
        clientName: users.name,
        clientEmail: users.email,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .innerJoin(users, eq(users.id, orders.clientId))
      .orderBy(desc(orders.createdAt))
      .limit(limit),
    db
      .select({
        id: orderUpdates.id,
        orderId: orderUpdates.orderId,
        statusChangedTo: orderUpdates.statusChangedTo,
        isInternal: orderUpdates.isInternal,
        message: orderUpdates.message,
        createdAt: orderUpdates.createdAt,
        orderTitle: orders.title,
      })
      .from(orderUpdates)
      .innerJoin(orders, eq(orders.id, orderUpdates.orderId))
      .orderBy(desc(orderUpdates.createdAt))
      .limit(limit),
  ]);

  const entries: ActivityEntry[] = [
    ...leadRows.map<ActivityEntry>((r) => ({
      kind: "lead",
      id: r.id,
      at: r.createdAt,
      label: `New lead — ${r.name || r.email}`,
      sub: `via ${r.source}`,
      href: `/dashboard/leads/${r.id}`,
    })),
    ...orderRows.map<ActivityEntry>((r) => ({
      kind: "order",
      id: r.id,
      at: r.createdAt,
      label: `Order created — ${r.title}`,
      sub: r.clientName || r.clientEmail,
      href: `/dashboard/orders/${r.id}`,
    })),
    ...updateRows.map<ActivityEntry>((r) => ({
      kind: "update",
      id: r.id,
      at: r.createdAt,
      label: r.statusChangedTo
        ? `Status → ${r.statusChangedTo} on ${r.orderTitle}`
        : `Update on ${r.orderTitle}`,
      sub: r.isInternal
        ? "internal note"
        : r.message.slice(0, 80) + (r.message.length > 80 ? "…" : ""),
      href: `/dashboard/orders/${r.orderId}`,
    })),
  ];

  entries.sort((a, b) => b.at.getTime() - a.at.getTime());
  return entries.slice(0, limit);
}
