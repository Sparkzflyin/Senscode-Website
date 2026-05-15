"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { submitReview, getReviewByToken } from "@/lib/reviews";

export type SubmitReviewState = {
  error?: string;
};

export async function submitReviewAction(
  token: string,
  _prev: SubmitReviewState,
  formData: FormData,
): Promise<SubmitReviewState> {
  const review = await getReviewByToken(token);
  if (!review) return { error: "Invalid review link." };
  if (review.submittedAt) {
    redirect(`/review/${token}/thanks`);
  }

  const rawRating = formData.get("rating");
  const rating = typeof rawRating === "string" ? parseInt(rawRating, 10) : NaN;
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { error: "Pick a rating between 1 and 5." };
  }

  const quote = (formData.get("quote") as string | null)?.trim();
  if (!quote) return { error: "Add a quote." };
  if (quote.length > 1000) return { error: "Quote must be under 1000 chars." };

  const clientName = (formData.get("clientName") as string | null)?.trim();
  if (!clientName) return { error: "Add your name." };
  if (clientName.length > 120) return { error: "Name is too long." };

  const clientRole =
    (formData.get("clientRole") as string | null)?.trim() || undefined;
  if (clientRole && clientRole.length > 120) {
    return { error: "Role is too long." };
  }

  await submitReview(token, { rating, quote, clientName, clientRole });

  revalidatePath("/dashboard/reviews");
  redirect(`/review/${token}/thanks`);
}
