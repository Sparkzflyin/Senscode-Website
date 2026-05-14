import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";
import { isConfigured } from "@/sanity/env";
import { JsonLd, ORGANIZATION_LD, breadcrumbLd } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Field notes, case studies, and rants from the SensCode workbench.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "SensCode | Blog",
    description:
      "Field notes, case studies, and rants from the SensCode workbench.",
    url: "/blog",
    type: "website",
    images: [{ url: "/og-card.png", width: 2400, height: 1260 }],
  },
};

export const revalidate = 60;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const posts = isConfigured ? await getAllPosts() : [];

  return (
    <>
      <JsonLd
        graph={[
          ORGANIZATION_LD,
          breadcrumbLd([
            { name: "Home", url: "https://senscode.com/" },
            { name: "Blog", url: "https://senscode.com/blog" },
          ]),
        ]}
      />

      <header className="hero">
        <div className="hero-content reveal">
          <h1>Field Notes.</h1>
          <p>Things I learned the hard way, written down so you don&apos;t have to.</p>
        </div>
      </header>

      <section className="panel">
        {!isConfigured ? (
          <div
            className="card glass-panel no-spotlight"
            style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}
          >
            <h2>Blog incoming.</h2>
            <p className="card-desc">
              The CMS isn&apos;t wired up yet — once Christian connects Sanity,
              posts will appear here.
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div
            className="card glass-panel no-spotlight"
            style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}
          >
            <h2>No posts yet.</h2>
            <p className="card-desc">
              First post is in the oven. Check back soon.
            </p>
          </div>
        ) : (
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
                      src={urlFor(post.coverImage)
                        .width(800)
                        .height(450)
                        .quality(80)
                        .url()}
                      alt={post.coverImage.alt || post.title}
                      width={800}
                      height={450}
                      sizes="(max-width: 768px) 100vw, 400px"
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                      }}
                    />
                  </Link>
                )}
                {post.categories?.length ? (
                  <span className="tag">{post.categories[0].title}</span>
                ) : null}
                <h3 style={{ marginTop: 8 }}>
                  <Link
                    href={`/blog/${post.slug}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {post.title}
                  </Link>
                </h3>
                {post.excerpt ? (
                  <p className="card-desc">{post.excerpt}</p>
                ) : null}
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
        )}
      </section>
    </>
  );
}
