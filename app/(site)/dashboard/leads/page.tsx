import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { listLeads, leadStatusLabel } from "@/lib/leads";
import { formatDateTime } from "@/lib/format";

export default async function LeadsListPage() {
  await requireOwner();
  const rows = await listLeads();

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>Leads</h1>
          <p>Contact form and estimator submissions, newest first.</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="dashboard-empty">
          <p>No leads yet. Submissions to the contact form and project estimator will land here.</p>
        </div>
      ) : (
        <div>
          {rows.map((row) => (
            <Link
              key={row.id}
              href={`/dashboard/leads/${row.id}`}
              className="order-row"
            >
              <div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <strong style={{ fontSize: "1.05rem" }}>
                    {row.name || row.email}
                  </strong>
                  <span className="order-status" data-status={row.status}>
                    {leadStatusLabel(row.status)}
                  </span>
                </div>
                <div className="order-row-meta">
                  {row.name ? <span>{row.email}</span> : null}
                  <span>via {row.source}</span>
                  <span>{formatDateTime(row.createdAt)}</span>
                </div>
              </div>
              <div className="order-row-right">
                {row.convertedOrderId ? (
                  <span style={{ opacity: 0.7, fontSize: "0.9rem" }}>
                    → order
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
