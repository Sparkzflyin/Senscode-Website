"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { setReviewApproval, deleteReview } from "@/lib/reviews";

export async function approveReviewAction(formData: FormData) {
  await requireOwner();
  const id = (formData.get("id") as string | null)?.trim();
  const approved = formData.get("approved") === "true";
  if (!id) return;

  await setReviewApproval(id, approved);
  revalidatePath("/dashboard/reviews");
  revalidatePath("/portfolio");
}

export async function deleteReviewAction(formData: FormData) {
  await requireOwner();
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return;

  await deleteReview(id);
  revalidatePath("/dashboard/reviews");
  revalidatePath("/portfolio");
}
