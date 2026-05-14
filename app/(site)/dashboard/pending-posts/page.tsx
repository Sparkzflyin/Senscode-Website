import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { listPendingPosts } from "@/sanity/lib/pending";
import { isConfigured } from "@/sanity/env";

function formatRelative(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function PendingPostsPage() {
  await requireOwner();

  if (!isConfigured) {
    return (
      <>
        <div className="dashboard-page-header">
          <div>
            <h1>Pending posts</h1>
            <p>Sanity is not configured.</p>
          </div>
        </div>
      </>
    );
  }

  const hasToken = Boolean(process.env.SANITY_API_WRITE_TOKEN);
  const pending = hasToken ? await listPendingPosts() : [];

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>Pending posts</h1>
          <p>
            Drafts waiting on your green light. Approving publishes immediately;
            rejecting deletes the draft.
          </p>
        </div>
      </div>

      {!hasToken ? (
        <div className="dashboard-empty">
          <p>
            <strong>SANITY_API_WRITE_TOKEN is not set.</strong>
          </p>
          <p style={{ marginTop: 8, fontSize: "0.9rem", opacity: 0.85 }}>
            Create an Editor-level token in sanity.io/manage → API → Tokens, add
            it to Vercel as <code>SANITY_API_WRITE_TOKEN</code>, and redeploy.
          </p>
        </div>
      ) : pending.length === 0 ? (
        <div className="dashboard-empty">
          <p>Inbox zero. No drafts waiting on review.</p>
        </div>
      ) : (
        <div>
          {pending.map((p) => (
            <Link
              key={p._id}
              href={`/dashboard/pending-posts/${encodeURIComponent(p._id)}`}
              className="order-row"
            >
              <div>
                <strong style={{ fontSize: "1.05rem" }}>
                  {p.title || "(untitled)"}
                </strong>
                <div className="order-row-meta">
                  <span>{p.author?.name || "Unknown author"}</span>
                  <span>Last edited {formatRelative(p.updatedAt)}</span>
                  {p.categories?.length ? (
                    <span>{p.categories.map((c) => c.title).join(", ")}</span>
                  ) : null}
                </div>
              </div>
              <div className="order-row-right">
                <span style={{ opacity: 0.7, fontSize: "0.9rem" }}>Review →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
