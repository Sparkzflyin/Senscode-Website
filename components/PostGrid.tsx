import Image from "next/image";
import Link from "next/link";
import type { PostSummary } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function PostGrid({ posts }: { posts: PostSummary[] }) {
  return (
    <div className="grid-3">
      {posts.map((post) => (
        <article key={post._id} className="card glass-panel reveal">
          {post.coverImage?.asset && (
            <Link
              href={`/blog/${post.slug}`}
              style={{
                display: "block",
                marginBottom: 16,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <Image
                src={urlFor(post.coverImage).width(800).height(450).quality(80).url()}
                alt={post.coverImage.alt || post.title}
                width={800}
                height={450}
                sizes="(max-width: 768px) 100vw, 400px"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </Link>
          )}
          {post.categories?.length ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 4,
              }}
            >
              {post.categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/blog/category/${c.slug}`}
                  className="tag"
                  style={{ textDecoration: "none" }}
                >
                  {c.title}
                </Link>
              ))}
            </div>
          ) : null}
          <h3 style={{ marginTop: 8 }}>
            <Link
              href={`/blog/${post.slug}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {post.title}
            </Link>
          </h3>
          {post.excerpt ? <p className="card-desc">{post.excerpt}</p> : null}
          <div
            className="card-footer"
            style={{ justifyContent: "space-between" }}
          >
            <time
              dateTime={post.publishedAt}
              style={{ opacity: 0.7, fontSize: "0.9rem" }}
            >
              {formatDate(post.publishedAt)}
            </time>
            <Link href={`/blog/${post.slug}`} className="cta-button small-btn">
              Read
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
