import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { reviews, orders } from "@/db/schema";
import { ReviewForm } from "./ReviewForm";

export const dynamic = "force-dynamic";

export default async function PublicReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const db = getDb();
  const [row] = await db
    .select({
      submittedAt: reviews.submittedAt,
      orderTitle: orders.title,
    })
    .from(reviews)
    .innerJoin(orders, eq(orders.id, reviews.orderId))
    .where(eq(reviews.token, token))
    .limit(1);

  if (!row) notFound();
  if (row.submittedAt) redirect(`/review/${token}/thanks`);

  return (
    <main className="quote-public">
      <header className="quote-public-head">
        <span className="tag">Review</span>
        <h1>How&apos;d it go?</h1>
        <p className="quote-public-meta">
          For <strong>{row.orderTitle}</strong> · drop a quick note for the
          site
        </p>
      </header>

      <section className="quote-public-section">
        <ReviewForm token={token} />
      </section>
    </main>
  );
}
