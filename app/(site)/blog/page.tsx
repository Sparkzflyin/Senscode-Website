import type { Metadata } from "next";
import { getAllPosts, getCategoriesWithPosts } from "@/sanity/lib/fetch";
import { isConfigured } from "@/sanity/env";
import { JsonLd, ORGANIZATION_LD, breadcrumbLd } from "@/lib/jsonLd";
import { CategoryChips } from "@/components/CategoryChips";
import { PostGrid } from "@/components/PostGrid";

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

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    isConfigured ? getAllPosts() : Promise.resolve([]),
    isConfigured ? getCategoriesWithPosts() : Promise.resolve([]),
  ]);

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
          <>
            <CategoryChips categories={categories} activeSlug={null} />
            <PostGrid posts={posts} />
          </>
        )}
      </section>
    </>
  );
}
