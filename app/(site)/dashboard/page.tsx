import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/db";
import { orders, users } from "@/db/schema";

export default async function DashboardOverview() {
  const session = await requireAuth();
  const isOwner = session.user.role === "owner";
  const db = getDb();

  if (isOwner) {
    const [orderCounts] = await db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) filter (where status in ('new', 'in_progress', 'review'))::int`,
      })
      .from(orders);

    const [clientCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, "client"));

    return (
      <>
        <div className="dashboard-page-header">
          <div>
            <h1>Overview</h1>
            <p>
              Welcome back{session.user.name ? `, ${session.user.name}` : ""}.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/dashboard/orders/new" className="cta-button small-btn">
              + New order
            </Link>
            <Link href="/studio" className="cta-button small-btn">
              + Create new post
            </Link>
            <Link
              href="/blog"
              className="cta-button small-btn"
              style={{ background: "transparent" }}
            >
              View blog ↗
            </Link>
          </div>
        </div>

        <div className="grid-3">
          <div className="card glass-panel no-spotlight">
            <span className="tag">Orders</span>
            <h2 style={{ fontSize: "2.2rem", marginTop: 8, marginBottom: 0 }}>
              {orderCounts?.total ?? 0}
            </h2>
            <p className="card-desc" style={{ marginTop: 4 }}>
              total orders
            </p>
          </div>
          <div className="card glass-panel no-spotlight">
            <span className="tag">Active</span>
            <h2 style={{ fontSize: "2.2rem", marginTop: 8, marginBottom: 0 }}>
              {orderCounts?.active ?? 0}
            </h2>
            <p className="card-desc" style={{ marginTop: 4 }}>
              in flight
            </p>
          </div>
          <div className="card glass-panel no-spotlight">
            <span className="tag">Clients</span>
            <h2 style={{ fontSize: "2.2rem", marginTop: 8, marginBottom: 0 }}>
              {clientCount?.count ?? 0}
            </h2>
            <p className="card-desc" style={{ marginTop: 4 }}>
              accounts
            </p>
          </div>
        </div>
      </>
    );
  }

  // Client view
  const canAuthorBlog = session.user.canAuthorBlog === true;
  const [myOrderCounts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where status in ('new', 'in_progress', 'review'))::int`,
    })
    .from(orders)
    .where(eq(orders.clientId, session.user.id));

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>Hey{session.user.name ? `, ${session.user.name}` : ""}.</h1>
          <p>Here&apos;s where your projects live.</p>
        </div>
        {canAuthorBlog ? (
          <Link href="/studio" className="cta-button small-btn">
            + Create new post
          </Link>
        ) : null}
      </div>

      <div className="grid-3">
        <div className="card glass-panel no-spotlight">
          <span className="tag">Projects</span>
          <h2 style={{ fontSize: "2.2rem", marginTop: 8, marginBottom: 0 }}>
            {myOrderCounts?.total ?? 0}
          </h2>
          <p className="card-desc" style={{ marginTop: 4 }}>
            total
          </p>
        </div>
        <div className="card glass-panel no-spotlight">
          <span className="tag">In progress</span>
          <h2 style={{ fontSize: "2.2rem", marginTop: 8, marginBottom: 0 }}>
            {myOrderCounts?.active ?? 0}
          </h2>
          <p className="card-desc" style={{ marginTop: 4 }}>
            active
          </p>
        </div>
      </div>

      {(myOrderCounts?.total ?? 0) === 0 ? (
        <div className="dashboard-empty" style={{ marginTop: 32 }}>
          <p>
            No active projects yet. Once Christian kicks off an order for you
            it&apos;ll appear under{" "}
            <Link href="/dashboard/orders" style={{ color: "var(--link)" }}>
              Your orders
            </Link>{" "}
            with status, deliverables, and a timeline.
          </p>
        </div>
      ) : (
        <p style={{ marginTop: 32 }}>
          See everything under{" "}
          <Link href="/dashboard/orders" style={{ color: "var(--link)" }}>
            Your orders
          </Link>
          .
        </p>
      )}
    </>
  );
}
