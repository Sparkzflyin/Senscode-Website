import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { leads } from "@/db/schema";
import type { QuoteData } from "@/db/schema";
import { formatDate, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function QuoteAcceptedPage({
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

  return (
    <main className="quote-public">
      <header className="quote-public-head">
        <span className="tag">Accepted</span>
        <h1>{quote.title}</h1>
        <p className="quote-public-meta">
          {lead.quoteAcceptedAt
            ? `Confirmed ${formatDate(lead.quoteAcceptedAt)}`
            : "Confirmed"}
          {" · "}
          {formatMoney(quote.totalCents)}
        </p>
      </header>

      <section className="quote-public-section">
        <h2>You&apos;re in.</h2>
        <p style={{ opacity: 0.85 }}>
          Christian got the notification — he&apos;ll be in touch within 24
          hours with kickoff details. The project shows up in your dashboard
          once you sign in.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          <Link href="/signin" className="cta-button">
            Sign in
          </Link>
          <Link
            href="/"
            className="cta-button small-btn"
            style={{ background: "transparent" }}
          >
            Back to site
          </Link>
        </div>
      </section>
    </main>
  );
}
