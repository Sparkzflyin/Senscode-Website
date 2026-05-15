"use client";

import { useState, useTransition } from "react";
import { deleteLeadAction } from "./actions";

export function DeleteLeadButton({ leadId }: { leadId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        className="danger-btn"
        onClick={() => setConfirming(true)}
      >
        Delete
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: "0.9rem", color: "#f43f5e" }}>
        Delete permanently?
      </span>
      <button
        type="button"
        className="danger-btn"
        disabled={pending}
        onClick={() => {
          const fd = new FormData();
          fd.set("id", leadId);
          startTransition(() => {
            void deleteLeadAction(fd);
          });
        }}
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        className="cta-button small-btn"
        style={{ background: "transparent" }}
        disabled={pending}
        onClick={() => setConfirming(false)}
      >
        Cancel
      </button>
    </div>
  );
}
