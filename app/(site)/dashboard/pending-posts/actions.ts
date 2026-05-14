"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { getWriteClient } from "@/sanity/lib/writeClient";

export type ReviewActionResult = { error?: string; slug?: string };

function assertDraftId(id: string) {
  if (!id.startsWith("drafts.")) {
    throw new Error("Refusing to act on a non-draft document.");
  }
}

export async function approvePostAction(
  draftId: string,
): Promise<ReviewActionResult> {
  await requireOwner();
  assertDraftId(draftId);

  const client = getWriteClient();
  if (!client) {
    return {
      error:
        "Sanity write client not configured. Add SANITY_API_WRITE_TOKEN to env.",
    };
  }

  const publishedId = draftId.replace(/^drafts\./, "");
  const draft = await client.getDocument(draftId);
  if (!draft) return { error: "Draft no longer exists." };

  // Build the published doc from the draft: same content, but the published ID.
  // We strip _id/_rev/_updatedAt/_createdAt so Sanity owns the published copy's
  // identity and metadata.
  const { _id, _rev, _updatedAt, _createdAt, ...content } = draft;
  void _id;
  void _rev;
  void _updatedAt;
  void _createdAt;

  await client
    .transaction()
    .createOrReplace({ ...content, _id: publishedId })
    .delete(draftId)
    .commit();

  // Public blog pages cache via these tags (see sanity/lib/fetch.ts). Next 16
  // requires the second `profile` arg — "max" gives stale-while-revalidate.
  revalidateTag("post", "max");
  revalidatePath("/blog");
  revalidatePath("/dashboard/pending-posts");
  revalidatePath("/dashboard");

  // Surface the slug so the client can offer a direct link to the now-live
  // post instead of bouncing back to the queue.
  const slug =
    typeof content === "object" && content && "slug" in content
      ? (content.slug as { current?: string } | undefined)?.current
      : undefined;

  return { slug };
}

export async function rejectPostAction(
  draftId: string,
): Promise<ReviewActionResult> {
  await requireOwner();
  assertDraftId(draftId);

  const client = getWriteClient();
  if (!client) {
    return {
      error:
        "Sanity write client not configured. Add SANITY_API_WRITE_TOKEN to env.",
    };
  }

  await client.delete(draftId);

  revalidatePath("/dashboard/pending-posts");
  revalidatePath("/dashboard");
  return {};
}
