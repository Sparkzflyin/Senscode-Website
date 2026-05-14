import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { getLead, leadStatusLabel } from "@/lib/leads";
import { formatDateTime } from "@/lib/format";
import { ConvertButton } from "./ConvertButton";
import { updateLeadStatusAction } from "./actions";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireOwner();
  const lead = await getLead(id);
  if (!lead) notFound();

  const payload = (lead.payload ?? {}) as Record<string, unknown>;
  const entries = Object.entries(payload).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  );

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ margin: 0 }}>{lead.name || lead.email}</h1>
            <span className="order-status" data-status={lead.status}>
              {leadStatusLabel(lead.status)}
            </span>
          </div>
          <p style={{ marginTop: 6 }}>
            {lead.name ? <>{lead.email} · </> : null}
            via <strong>{lead.source}</strong> · {formatDateTime(lead.createdAt)}
          </p>
        </div>
        <Link
          href="/dashboard/leads"
          style={{ opacity: 0.7, fontSize: "0.95rem" }}
        >
          ← All leads
        </Link>
      </div>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.4rem", marginBottom: 12 }}>Submission</h2>
        {entries.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No fields captured.</p>
        ) : (
          <dl className="lead-fields">
            {entries.map(([k, v]) => (
              <div key={k} className="lead-field">
                <dt>{k}</dt>
                <dd>
                  {typeof v === "string"
                    ? v
                    : JSON.stringify(v, null, 2)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.4rem", marginBottom: 12 }}>Actions</h2>
        {lead.status === "converted" && lead.convertedOrderId ? (
          <p>
            Already converted —{" "}
            <Link
              href={`/dashboard/orders/${lead.convertedOrderId}`}
              style={{ color: "var(--link)" }}
            >
              view order →
            </Link>
          </p>
        ) : (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <ConvertButton leadId={lead.id} />
            <form action={updateLeadStatusAction}>
              <input type="hidden" name="id" value={lead.id} />
              <input
                type="hidden"
                name="status"
                value={lead.status === "contacted" ? "new" : "contacted"}
              />
              <button
                type="submit"
                className="cta-button small-btn"
                style={{ background: "transparent" }}
              >
                {lead.status === "contacted"
                  ? "Mark as new"
                  : "Mark as contacted"}
              </button>
            </form>
            <form action={updateLeadStatusAction}>
              <input type="hidden" name="id" value={lead.id} />
              <input type="hidden" name="status" value="archived" />
              <button
                type="submit"
                className="cta-button small-btn"
                style={{ background: "transparent" }}
              >
                Archive
              </button>
            </form>
          </div>
        )}
      </section>
    </>
  );
}
