import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { getOwnerStats, getRecentActivity } from "@/lib/analytics";
import { formatMoney, formatDateTime } from "@/lib/format";

export default async function DashboardOverview() {
  const session = await requireAuth();
  const isOwner = session.user.role === "owner";
  const db = getDb();

  if (isOwner) {
    const [stats, activity] = await Promise.all([
      getOwnerStats(),
      getRecentActivity(8),
    ]);

    const fmtDays = (d: number | null) =>
      d === null
        ? "—"
        : d < 1
          ? `${Math.round(d * 24)}h`
          : `${d.toFixed(1)}d`;

    const fmtPct = (p: number | null) =>
      p === null ? "—" : `${p.toFixed(0)}%`;

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

        <section style={{ marginBottom: 32 }}>
          <h2 className="dashboard-section-title">Revenue</h2>
          <div className="grid-3">
            <div className="card glass-panel no-spotlight">
              <span className="tag">This month</span>
              <h2 className="stat-figure">
                {formatMoney(stats.revenue.thisMonthCents)}
              </h2>
              <p className="card-desc stat-sub">completed orders</p>
            </div>
            <div className="card glass-panel no-spotlight">
              <span className="tag">Lifetime</span>
              <h2 className="stat-figure">
                {formatMoney(stats.revenue.lifetimeCents)}
              </h2>
              <p className="card-desc stat-sub">all-time completed</p>
            </div>
            <div className="card glass-panel no-spotlight">
              <span className="tag">Clients</span>
              <h2 className="stat-figure">{stats.totalClients}</h2>
              <p className="card-desc stat-sub">accounts on file</p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 32 }}>
          <div className="dashboard-section-head">
            <h2 className="dashboard-section-title">Order pipeline</h2>
            <Link href="/dashboard/orders" className="dashboard-section-link">
              View all →
            </Link>
          </div>
          <div className="pipeline-grid">
            {(
              [
                ["new", "New"],
                ["in_progress", "In Progress"],
                ["review", "Review"],
                ["completed", "Completed"],
                ["on_hold", "On Hold"],
                ["cancelled", "Cancelled"],
              ] as const
            ).map(([key, label]) => (
              <div
                key={key}
                className="pipeline-cell"
                data-status={key}
              >
                <span className="pipeline-count">
                  {stats.ordersByStatus[key]}
                </span>
                <span className="pipeline-label">{label}</span>
              </div>
            ))}
          </div>
          <p className="card-desc" style={{ marginTop: 12 }}>
            {stats.activeOrders} active · {stats.totalOrders} total
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <div className="dashboard-section-head">
            <h2 className="dashboard-section-title">Lead funnel</h2>
            <Link href="/dashboard/leads" className="dashboard-section-link">
              View all →
            </Link>
          </div>
          <div className="grid-3">
            <div className="card glass-panel no-spotlight">
              <span className="tag">New leads</span>
              <h2 className="stat-figure">{stats.leadsByStatus.new}</h2>
              <p className="card-desc stat-sub">awaiting first touch</p>
            </div>
            <div className="card glass-panel no-spotlight">
              <span className="tag">Conversion rate</span>
              <h2 className="stat-figure">
                {fmtPct(stats.conversionRatePct)}
              </h2>
              <p className="card-desc stat-sub">
                {stats.leadsByStatus.converted} / {stats.totalLeads} converted
              </p>
            </div>
            <div className="card glass-panel no-spotlight">
              <span className="tag">Avg time to close</span>
              <h2 className="stat-figure">
                {fmtDays(stats.avgTimeToConversionDays)}
              </h2>
              <p className="card-desc stat-sub">lead → order</p>
            </div>
          </div>
          <div className="source-split">
            <span className="source-split-label">Sources</span>
            <div className="source-split-bars">
              {(["contact", "estimator"] as const).map((src) => {
                const count = stats.leadsBySource[src];
                const pct =
                  stats.totalLeads > 0
                    ? (count / stats.totalLeads) * 100
                    : 0;
                return (
                  <div key={src} className="source-split-row">
                    <span className="source-split-name">{src}</span>
                    <div className="source-split-track">
                      <div
                        className="source-split-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="source-split-count">
                      {count} ({Math.round(pct)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <h2 className="dashboard-section-title">Recent activity</h2>
          {activity.length === 0 ? (
            <div className="dashboard-empty">
              <p>No activity yet.</p>
            </div>
          ) : (
            <ul className="activity-feed">
              {activity.map((e) => (
                <li key={`${e.kind}-${e.id}`} className="activity-item">
                  <Link href={e.href} className="activity-link">
                    <span
                      className="activity-kind"
                      data-kind={e.kind}
                      aria-hidden="true"
                    />
                    <span className="activity-body">
                      <span className="activity-label">{e.label}</span>
                      <span className="activity-sub">{e.sub}</span>
                    </span>
                    <span className="activity-time">
                      {formatDateTime(e.at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
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

