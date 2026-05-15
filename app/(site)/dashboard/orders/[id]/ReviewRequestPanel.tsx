import { headers } from "next/headers";
import { createReviewRequestAction } from "./actions";
import type { Review } from "@/db/schema";
import { formatDateTime } from "@/lib/format";

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} of 5 stars`}>
      {"★".repeat(rating)}
      <span style={{ opacity: 0.35 }}>{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export async function ReviewRequestPanel({
  orderId,
  review,
}: {
  orderId: string;
  review: Review | null;
}) {
  const hdrs = await headers();
  const host = hdrs.get("host") ?? "";
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  const reviewUrl = review ? `${proto}://${host}/review/${review.token}` : null;

  if (!review) {
    return (
      <section
        style={{
          marginBottom: 32,
          padding: 20,
          border: "1px solid var(--border)",
          borderRadius: 12,
          background: "var(--glass)",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", margin: "0 0 8px" }}>
          Request a review
        </h2>
        <p style={{ opacity: 0.75, margin: "0 0 14px", fontSize: "0.95rem" }}>
          Project&apos;s wrapped — generate a tokenized review link to share
          with the client. Approved reviews surface on{" "}
          <strong>/portfolio</strong>.
        </p>
        <form action={createReviewRequestAction}>
          <input type="hidden" name="orderId" value={orderId} />
          <button type="submit" className="cta-button small-btn">
            Generate review link
          </button>
        </form>
      </section>
    );
  }

  return (
    <section
      style={{
        marginBottom: 32,
        padding: 20,
        border: "1px solid var(--border)",
        borderRadius: 12,
        background: "var(--glass)",
      }}
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
        <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Review</h2>
        <span
          className="order-status"
          data-status={
            review.approved
              ? "completed"
              : review.submittedAt
                ? "review"
                : "new"
          }
        >
          {review.approved
            ? "Approved"
            : review.submittedAt
              ? "Awaiting approval"
              : "Awaiting submission"}
        </span>
      </div>

      {review.submittedAt && review.rating && review.quote ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: "1.4rem", color: "#ff9500" }}>
            <Stars rating={review.rating} />
          </div>
          <p
            style={{
              marginTop: 10,
              fontStyle: "italic",
              opacity: 0.9,
              whiteSpace: "pre-wrap",
            }}
          >
            &ldquo;{review.quote}&rdquo;
          </p>
          <p style={{ opacity: 0.7, fontSize: "0.9rem", margin: "4px 0 0" }}>
            — {review.clientName}
            {review.clientRole ? `, ${review.clientRole}` : ""}
            {review.submittedAt
              ? ` · submitted ${formatDateTime(review.submittedAt)}`
              : null}
          </p>
        </div>
      ) : (
        <p
          style={{
            opacity: 0.75,
            margin: "10px 0 0",
            fontSize: "0.9rem",
          }}
        >
          Link generated {formatDateTime(review.tokenIssuedAt)}. Waiting on the
          client to fill it out.
        </p>
      )}

      {reviewUrl ? (
        <div className="quote-share-row" style={{ marginTop: 14 }}>
          <span className="quote-share-label">Share link</span>
          <code className="quote-share-link">{reviewUrl}</code>
        </div>
      ) : null}
    </section>
  );
}
