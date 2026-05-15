import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, reviews, users } from "@/db/schema";
import type { Review } from "@/db/schema";

function generateToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function getReviewForOrder(
  orderId: string,
): Promise<Review | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.orderId, orderId))
    .limit(1);
  return row ?? null;
}

export async function createReviewRequest(orderId: string): Promise<Review> {
  const db = getDb();
  // Idempotent — one review request per order.
  const existing = await getReviewForOrder(orderId);
  if (existing) return existing;

  const [created] = await db
    .insert(reviews)
    .values({
      orderId,
      token: generateToken(),
    })
    .returning();
  return created;
}

export async function getReviewByToken(token: string): Promise<Review | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.token, token))
    .limit(1);
  return row ?? null;
}

export async function submitReview(
  token: string,
  input: {
    rating: number;
    quote: string;
    clientName: string;
    clientRole?: string;
  },
): Promise<Review | null> {
  const db = getDb();
  const [updated] = await db
    .update(reviews)
    .set({
      rating: input.rating,
      quote: input.quote,
      clientName: input.clientName,
      clientRole: input.clientRole || null,
      submittedAt: new Date(),
    })
    .where(eq(reviews.token, token))
    .returning();
  return updated ?? null;
}

export type ReviewRow = Review & {
  orderTitle: string;
  clientEmail: string;
};

export async function listReviewsForOwner(): Promise<ReviewRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: reviews.id,
      orderId: reviews.orderId,
      token: reviews.token,
      rating: reviews.rating,
      quote: reviews.quote,
      clientName: reviews.clientName,
      clientRole: reviews.clientRole,
      submittedAt: reviews.submittedAt,
      approved: reviews.approved,
      approvedAt: reviews.approvedAt,
      tokenIssuedAt: reviews.tokenIssuedAt,
      orderTitle: orders.title,
      clientEmail: users.email,
    })
    .from(reviews)
    .innerJoin(orders, eq(orders.id, reviews.orderId))
    .innerJoin(users, eq(users.id, orders.clientId))
    .orderBy(desc(reviews.tokenIssuedAt));
  return rows;
}

export type PublicReview = {
  id: string;
  rating: number;
  quote: string;
  clientName: string;
  clientRole: string | null;
  orderTitle: string;
  approvedAt: Date;
};

export async function listApprovedReviews(): Promise<PublicReview[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      quote: reviews.quote,
      clientName: reviews.clientName,
      clientRole: reviews.clientRole,
      approvedAt: reviews.approvedAt,
      orderTitle: orders.title,
    })
    .from(reviews)
    .innerJoin(orders, eq(orders.id, reviews.orderId))
    .where(
      and(
        eq(reviews.approved, true),
        isNotNull(reviews.submittedAt),
        isNotNull(reviews.rating),
        isNotNull(reviews.quote),
        isNotNull(reviews.clientName),
      ),
    )
    .orderBy(desc(reviews.approvedAt));

  return rows
    .filter(
      (r) =>
        r.rating !== null &&
        r.quote !== null &&
        r.clientName !== null &&
        r.approvedAt !== null,
    )
    .map((r) => ({
      id: r.id,
      rating: r.rating!,
      quote: r.quote!,
      clientName: r.clientName!,
      clientRole: r.clientRole,
      orderTitle: r.orderTitle,
      approvedAt: r.approvedAt!,
    }));
}

export async function setReviewApproval(
  id: string,
  approved: boolean,
): Promise<void> {
  const db = getDb();
  await db
    .update(reviews)
    .set({
      approved,
      approvedAt: approved ? new Date() : null,
    })
    .where(eq(reviews.id, id));
}

export async function deleteReview(id: string): Promise<void> {
  const db = getDb();
  await db.delete(reviews).where(eq(reviews.id, id));
}

// Reviews submitted but not yet approved — drives the nav badge.
export async function countPendingReviews(): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviews)
    .where(and(isNotNull(reviews.submittedAt), eq(reviews.approved, false)));
  return row?.count ?? 0;
}
