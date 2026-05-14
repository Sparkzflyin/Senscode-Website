"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { approvePostAction, rejectPostAction } from "./actions";

export function ReviewButtons({
  draftId,
  title,
}: {
  draftId: string;
  title: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleApprove() {
    if (
      !confirm(
        `Approve "${title}" and publish it to the live blog? This is immediate and visible to everyone.`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await approvePostAction(draftId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/dashboard/pending-posts");
      router.refresh();
    });
  }

  function handleReject() {
    if (
      !confirm(
        `Reject "${title}"? The draft will be permanently deleted. The author will need to redo their work to resubmit.`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rejectPostAction(draftId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/dashboard/pending-posts");
      router.refresh();
    });
  }

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={handleApprove}
        disabled={pending}
        className="cta-button"
      >
        {pending ? "Working…" : "Approve & publish"}
      </button>
      <button
        type="button"
        onClick={handleReject}
        disabled={pending}
        className="danger-btn"
      >
        {pending ? "Working…" : "Reject (delete draft)"}
      </button>
      {error ? (
        <p
          style={{ color: "#ff6b6b", flexBasis: "100%", marginTop: 8 }}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
