import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { requireOwner } from "@/lib/auth";
import { getLead, leadStatusLabel } from "@/lib/leads";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { QuoteData } from "@/db/schema";
import { ConvertButton } from "./ConvertButton";
import { DeleteLeadButton } from "./DeleteLeadButton";
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

  const quote = (lead.quoteData ?? null) as QuoteData | null;
  const hdrs = await headers();
  const host = hdrs.get("host") ?? "";
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  const quoteUrl = lead.quoteToken
    ? `${proto}://${host}/quote/${lead.quoteToken}`
    : null;

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

      {quote ? (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: 12 }}>Quote</h2>
          <div className="quote-summary card glass-panel no-spotlight">
            <div className="quote-summary-head">
              <div>
                <strong style={{ fontSize: "1.1rem" }}>{quote.title}</strong>
                <p
                  style={{
                    opacity: 0.7,
                    fontSize: "0.85rem",
                    margin: "4px 0 0",
                  }}
                >
                  {quote.items.length} line item
                  {quote.items.length === 1 ? "" : "s"} ·{" "}
                  {formatMoney(quote.totalCents)}
                  {lead.quoteSentAt
                    ? ` · sent ${formatDateTime(lead.quoteSentAt)}`
                    : null}
                  {lead.quoteAcceptedAt
                    ? ` · accepted ${formatDateTime(lead.quoteAcceptedAt)}`
                    : null}
                </p>
              </div>
              <Link
                href={`/dashboard/leads/${lead.id}/quote`}
                className="cta-button small-btn"
                style={{ background: "transparent" }}
              >
                Edit
              </Link>
            </div>
            {quoteUrl ? (
              <div className="quote-share-row">
                <span className="quote-share-label">Share link</span>
                <code className="quote-share-link">{quoteUrl}</code>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

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
            <Link
              href={`/dashboard/leads/${lead.id}/quote`}
              className="cta-button small-btn"
            >
              {quote ? "Edit quote" : "Draft quote"}
            </Link>
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

      <section
        style={{
          marginTop: 16,
          paddingTop: 20,
          borderTop: "1px solid var(--border)",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            margin: "0 0 8px",
            opacity: 0.7,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Danger zone
        </h2>
        <p
          style={{
            opacity: 0.7,
            fontSize: "0.9rem",
            margin: "0 0 14px",
          }}
        >
          Deleting removes the submission permanently. Any order already
          created from this lead stays put.
        </p>
        <DeleteLeadButton leadId={lead.id} />
      </section>
    </>
  );
}
