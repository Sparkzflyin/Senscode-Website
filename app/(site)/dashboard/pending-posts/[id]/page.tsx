import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { getPendingPostById } from "@/sanity/lib/pending";
import { urlFor } from "@/sanity/lib/image";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";
import { ReviewButtons } from "../ReviewButtons";

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PendingPostReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwner();
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);

  const post = await getPendingPostById(id);
  if (!post) notFound();

  // Type guard — we know body is portable text from the Sanity schema.
  const body = post.body as Parameters<typeof PortableTextRenderer>[0]["value"];

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1 style={{ margin: 0 }}>{post.title || "(untitled)"}</h1>
          <p style={{ marginTop: 6 }}>
            by <strong>{post.author?.name || "Unknown"}</strong> · last edited{" "}
            {formatDate(post.updatedAt)} · scheduled for{" "}
            {formatDate(post.publishedAt)}
          </p>
        </div>
        <Link
          href="/dashboard/pending-posts"
          style={{ opacity: 0.7, fontSize: "0.95rem" }}
        >
          ← All pending
        </Link>
      </div>

      <section
        className="card glass-panel no-spotlight"
        style={{ marginBottom: 32, padding: "20px 24px" }}
      >
        <span className="tag">Decide</span>
        <p style={{ marginTop: 10, marginBottom: 16, opacity: 0.85 }}>
          Approving publishes this immediately to{" "}
          <code>/blog/{post.slug || "(no slug yet)"}</code>. Rejecting deletes
          the draft.
        </p>
        <ReviewButtons
          draftId={post._id}
          title={post.title || "(untitled)"}
        />
      </section>

      <section style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          {post.categories?.map((c) => (
            <span key={c.slug} className="tag">
              {c.title}
            </span>
          ))}
        </div>

        {post.excerpt ? (
          <p
            style={{
              fontSize: "1.1rem",
              opacity: 0.85,
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            {post.excerpt}
          </p>
        ) : null}

        {post.coverImage?.asset ? (
          <Image
            src={urlFor(post.coverImage).width(1600).quality(85).url()}
            alt={post.coverImage.alt || post.title || "Cover image"}
            width={1600}
            height={900}
            sizes="(max-width: 768px) 100vw, 760px"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: 16,
              marginBottom: 24,
            }}
          />
        ) : null}

        <div style={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
          {body ? (
            <PortableTextRenderer value={body} />
          ) : (
            <p style={{ opacity: 0.6 }}>(No body content yet.)</p>
          )}
        </div>
      </section>
    </>
  );
}
