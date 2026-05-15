import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { reviews } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function ReviewThanksPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const db = getDb();
  const [row] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.token, token))
    .limit(1);
  if (!row) notFound();

  return (
    <main className="quote-public">
      <header className="quote-public-head">
        <span className="tag">Thanks</span>
        <h1>Appreciate you.</h1>
        <p className="quote-public-meta">
          The review is in. Christian will give it a look and ship it to the
          portfolio.
        </p>
      </header>

      <section className="quote-public-section">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/" className="cta-button">
            Back to site
          </Link>
          <Link
            href="/portfolio"
            className="cta-button small-btn"
            style={{ background: "transparent" }}
          >
            See the portfolio
          </Link>
        </div>
      </section>
    </main>
  );
}
