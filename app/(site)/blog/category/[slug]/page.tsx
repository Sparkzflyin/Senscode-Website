import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllCategorySlugs,
  getCategoriesWithPosts,
  getCategoryBySlug,
  getPostsByCategory,
} from "@/sanity/lib/fetch";
import { isConfigured } from "@/sanity/env";
import { JsonLd, ORGANIZATION_LD, breadcrumbLd } from "@/lib/jsonLd";
import { CategoryChips } from "@/components/CategoryChips";
import { PostGrid } from "@/components/PostGrid";

export const revalidate = 60;
export const dynamicParams = true;

type Params = { slug: string };

export async function generateStaticParams() {
  if (!isConfigured) return [];
  const slugs = await getAllCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.title} · Blog`,
    description:
      category.description ||
      `Posts in ${category.title} from the SensCode workbench.`,
    alternates: { canonical: `/blog/category/${slug}` },
    openGraph: {
      title: `${category.title} · SensCode Blog`,
      description:
        category.description ||
        `Posts in ${category.title} from the SensCode workbench.`,
      url: `/blog/category/${slug}`,
      type: "website",
      images: [{ url: "/og-card.png", width: 2400, height: 1260 }],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const [category, posts, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getPostsByCategory(slug),
    getCategoriesWithPosts(),
  ]);

  if (!category) notFound();

  return (
    <>
      <JsonLd
        graph={[
          ORGANIZATION_LD,
          breadcrumbLd([
            { name: "Home", url: "https://senscode.com/" },
            { name: "Blog", url: "https://senscode.com/blog" },
            {
              name: category.title,
              url: `https://senscode.com/blog/category/${slug}`,
            },
          ]),
        ]}
      />

      <header className="hero">
        <div className="hero-content reveal">
          <span className="tag">Category</span>
          <h1>{category.title}.</h1>
          {category.description ? <p>{category.description}</p> : null}
        </div>
      </header>

      <section className="panel">
        <CategoryChips categories={categories} activeSlug={slug} />
        {posts.length === 0 ? (
          <div
            className="card glass-panel no-spotlight"
            style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}
          >
            <h2>Nothing here yet.</h2>
            <p className="card-desc">
              No posts in this category.{" "}
              <Link href="/blog" style={{ color: "var(--link)" }}>
                Back to all posts
              </Link>
              .
            </p>
          </div>
        ) : (
          <PostGrid posts={posts} />
        )}
      </section>
    </>
  );
}
