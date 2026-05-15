import Link from "next/link";
import { and, asc, eq, isNotNull, sql } from "drizzle-orm";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/db";
import { orders, users } from "@/db/schema";
import type { OrderStatus } from "@/db/schema";
import { formatDate, formatMoney, statusLabel } from "@/lib/format";

type Row = {
  id: string;
  title: string;
  status: OrderStatus;
  dueDate: Date;
  totalCents: number;
  clientName: string | null;
  clientEmail: string;
};

const TERMINAL_STATUSES = new Set<OrderStatus>(["completed", "cancelled"]);

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  // Week starts Monday (1). Day 0 = Sunday → wrap to previous Monday.
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}

function weekKey(d: Date): string {
  return startOfWeek(d).toISOString().slice(0, 10);
}

function weekLabel(start: Date): string {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (x: Date) =>
    x.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default async function CalendarPage() {
  await requireOwner();
  const db = getDb();

  const rows = await db
    .select({
      id: orders.id,
      title: orders.title,
      status: orders.status,
      dueDate: orders.dueDate,
      totalCents: orders.totalCents,
      clientName: users.name,
      clientEmail: users.email,
    })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.clientId))
    .where(
      and(
        isNotNull(orders.dueDate),
        sql`${orders.status} not in ('cancelled')`,
      ),
    )
    .orderBy(asc(orders.dueDate));

  const today = startOfDay(new Date());

  const live: Row[] = rows
    .filter((r): r is Row => r.dueDate !== null)
    .map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      dueDate: r.dueDate as Date,
      totalCents: r.totalCents,
      clientName: r.clientName,
      clientEmail: r.clientEmail,
    }));

  const overdue = live.filter(
    (r) => !TERMINAL_STATUSES.has(r.status) && r.dueDate < today,
  );
  const upcoming = live.filter(
    (r) => !TERMINAL_STATUSES.has(r.status) && r.dueDate >= today,
  );

  // Group upcoming by week
  const weeks = new Map<string, { start: Date; rows: Row[] }>();
  for (const r of upcoming) {
    const key = weekKey(r.dueDate);
    if (!weeks.has(key)) {
      weeks.set(key, { start: startOfWeek(r.dueDate), rows: [] });
    }
    weeks.get(key)!.rows.push(r);
  }
  const orderedWeeks = Array.from(weeks.values()).sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>Calendar</h1>
          <p>
            Orders with a due date, newest commitments first. Overdue stays
            pinned up top.
          </p>
        </div>
        <Link href="/dashboard/orders" className="cta-button small-btn">
          All orders
        </Link>
      </div>

      {overdue.length === 0 && upcoming.length === 0 ? (
        <div className="dashboard-empty">
          <p>
            No orders with a due date yet. Add one when creating or editing an
            order and it&apos;ll show up here.
          </p>
        </div>
      ) : null}

      {overdue.length > 0 ? (
        <section style={{ marginBottom: 36 }}>
          <h2 className="dashboard-section-title" style={{ color: "#f43f5e" }}>
            Overdue ({overdue.length})
          </h2>
          <CalendarList rows={overdue} overdue />
        </section>
      ) : null}

      {orderedWeeks.map((week) => (
        <section key={week.start.toISOString()} style={{ marginBottom: 28 }}>
          <h2 className="dashboard-section-title">{weekLabel(week.start)}</h2>
          <CalendarList rows={week.rows} />
        </section>
      ))}
    </>
  );
}

function CalendarList({ rows, overdue }: { rows: Row[]; overdue?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((r) => (
        <Link
          key={r.id}
          href={`/dashboard/orders/${r.id}`}
          className="order-row"
          style={
            overdue
              ? {
                  borderColor: "rgb(244 63 94 / 50%)",
                  background: "rgb(244 63 94 / 6%)",
                }
              : undefined
          }
        >
          <div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <strong style={{ fontSize: "1.05rem" }}>{r.title}</strong>
              <span className="order-status" data-status={r.status}>
                {statusLabel(r.status)}
              </span>
            </div>
            <div className="order-row-meta">
              <span>{r.clientName || r.clientEmail}</span>
              <span>Due {formatDate(r.dueDate)}</span>
            </div>
          </div>
          <div className="order-row-right">
            <span className="order-row-total">{formatMoney(r.totalCents)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
