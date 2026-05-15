import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { leads } from "@/db/schema";
import type { QuoteData } from "@/db/schema";
import { formatMoney, formatDate } from "@/lib/format";
import { AcceptButton } from "./AcceptButton";

export const dynamic = "force-dynamic";

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const db = getDb();
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.quoteToken, token))
    .limit(1);

  if (!lead || !lead.quoteData) notFound();

  const quote = lead.quoteData as QuoteData;
  const alreadyAccepted = Boolean(lead.quoteAcceptedAt);

  return (
    <main className="quote-public">
      <header className="quote-public-head">
        <span className="tag">Proposal</span>
        <h1>{quote.title}</h1>
        <p className="quote-public-meta">
          Prepared for <strong>{lead.name || lead.email}</strong>
          {lead.quoteSentAt ? <> · {formatDate(lead.quoteSentAt)}</> : null}
        </p>
      </header>

      {quote.description ? (
        <section className="quote-public-section">
          <h2>Scope</h2>
          <p style={{ whiteSpace: "pre-wrap", opacity: 0.85 }}>
            {quote.description}
          </p>
        </section>
      ) : null}

      <section className="quote-public-section">
        <h2>Line items</h2>
        <div className="quote-public-items">
          {quote.items.map((item, i) => (
            <div key={i} className="quote-public-line">
              <div>
                <strong>{item.description}</strong>
                {item.quantity !== 1 ? (
                  <span style={{ opacity: 0.7, marginLeft: 8 }}>
                    × {item.quantity}
                  </span>
                ) : null}
              </div>
              <span>{formatMoney(item.unitPriceCents * item.quantity)}</span>
            </div>
          ))}
          <div className="quote-public-total">
            <span>Total</span>
            <strong>{formatMoney(quote.totalCents)}</strong>
          </div>
        </div>
      </section>

      <section className="quote-public-cta">
        {alreadyAccepted ? (
          <div className="quote-public-accepted">
            <h2>Accepted · {formatDate(lead.quoteAcceptedAt)}</h2>
            <p>
              Thanks for the green light. Your project lives in your dashboard.
            </p>
            <Link href="/signin" className="cta-button small-btn">
              Sign in →
            </Link>
          </div>
        ) : (
          <>
            <p style={{ opacity: 0.75, marginBottom: 16 }}>
              Accepting this proposal kicks off the project and adds it to your
              dashboard. You&apos;ll get sign-in credentials separately.
            </p>
            <AcceptButton token={token} />
          </>
        )}
      </section>
    </main>
  );
}
