import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { listReviewsForOwner } from "@/lib/reviews";
import { formatDateTime } from "@/lib/format";
import { approveReviewAction, deleteReviewAction } from "./actions";

function Stars({ rating }: { rating: number }) {
  return (
    <span
      aria-label={`${rating} of 5 stars`}
      style={{ color: "#ff9500", fontSize: "1.1rem" }}
    >
      {"★".repeat(rating)}
      <span style={{ opacity: 0.35 }}>{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default async function ReviewsPage() {
  await requireOwner();
  const rows = await listReviewsForOwner();

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>Reviews</h1>
          <p>
            Approve to surface on{" "}
            <Link href="/portfolio" style={{ color: "var(--link)" }}>
              /portfolio
            </Link>
            . Generated from completed orders.
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="dashboard-empty">
          <p>
            No review requests yet. Once an order hits{" "}
            <strong>completed</strong>, you can generate a review link from its
            detail page.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map((r) => {
            const submitted = Boolean(r.submittedAt);
            return (
              <div
                key={r.id}
                className="card glass-panel no-spotlight"
                style={{ padding: 20 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <strong>{r.orderTitle}</strong>
                    <p
                      style={{
                        opacity: 0.7,
                        fontSize: "0.85rem",
                        margin: "4px 0 0",
                      }}
                    >
                      {r.clientEmail} · issued {formatDateTime(r.tokenIssuedAt)}
                    </p>
                  </div>
                  <span
                    className="order-status"
                    data-status={
                      r.approved
                        ? "completed"
                        : submitted
                          ? "review"
                          : "new"
                    }
                  >
                    {r.approved
                      ? "Approved"
                      : submitted
                        ? "Pending approval"
                        : "Awaiting client"}
                  </span>
                </div>

                {submitted && r.rating && r.quote && r.clientName ? (
                  <div style={{ marginTop: 14 }}>
                    <Stars rating={r.rating} />
                    <p
                      style={{
                        marginTop: 10,
                        fontStyle: "italic",
                        opacity: 0.9,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      &ldquo;{r.quote}&rdquo;
                    </p>
                    <p
                      style={{
                        opacity: 0.7,
                        fontSize: "0.9rem",
                        margin: "4px 0 0",
                      }}
                    >
                      — {r.clientName}
                      {r.clientRole ? `, ${r.clientRole}` : ""}
                      {r.submittedAt
                        ? ` · ${formatDateTime(r.submittedAt)}`
                        : ""}
                    </p>
                  </div>
                ) : (
                  <p
                    style={{
                      marginTop: 12,
                      opacity: 0.6,
                      fontSize: "0.9rem",
                    }}
                  >
                    Waiting on the client to submit.
                  </p>
                )}

                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  {submitted ? (
                    <form action={approveReviewAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <input
                        type="hidden"
                        name="approved"
                        value={r.approved ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className="cta-button small-btn"
                        style={
                          r.approved ? { background: "transparent" } : undefined
                        }
                      >
                        {r.approved ? "Unapprove" : "Approve"}
                      </button>
                    </form>
                  ) : null}
                  <Link
                    href={`/dashboard/orders/${r.orderId}`}
                    className="cta-button small-btn"
                    style={{ background: "transparent" }}
                  >
                    View order
                  </Link>
                  <form action={deleteReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="danger-btn">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
