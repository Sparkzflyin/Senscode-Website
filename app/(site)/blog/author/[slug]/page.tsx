import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getAllAuthorSlugs,
  getAuthorBySlug,
  getPostsByAuthor,
} from "@/sanity/lib/fetch";
import { isConfigured } from "@/sanity/env";
import { urlFor } from "@/sanity/lib/image";
import { JsonLd, ORGANIZATION_LD, breadcrumbLd } from "@/lib/jsonLd";
import { PostGrid } from "@/components/PostGrid";

export const revalidate = 60;
export const dynamicParams = true;

type Params = { slug: string };

export async function generateStaticParams() {
  if (!isConfigured) return [];
  const slugs = await getAllAuthorSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: "Author not found" };
  const description =
    author.bio ||
    `Posts by ${author.name} on the SensCode workbench.`;
  return {
    title: `${author.name} · Blog`,
    description,
    alternates: { canonical: `/blog/author/${slug}` },
    openGraph: {
      title: `${author.name} · SensCode Blog`,
      description,
      url: `/blog/author/${slug}`,
      type: "profile",
      images: author.avatar?.asset
        ? [
            {
              url: urlFor(author.avatar).width(1200).height(630).url(),
              width: 1200,
              height: 630,
            },
          ]
        : [{ url: "/og-card.png", width: 2400, height: 1260 }],
    },
  };
}

const SOCIAL_LABELS: Array<{
  key: "website" | "github" | "linkedin" | "instagram";
  label: string;
}> = [
  { key: "website", label: "Website" },
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "instagram", label: "Instagram" },
];

export default async function AuthorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const [author, posts] = await Promise.all([
    getAuthorBySlug(slug),
    getPostsByAuthor(slug),
  ]);

  if (!author) notFound();

  const socialLinks = SOCIAL_LABELS.flatMap((s) =>
    author.social?.[s.key] ? [{ label: s.label, href: author.social[s.key]! }] : [],
  );

  return (
    <>
      <JsonLd
        graph={[
          ORGANIZATION_LD,
          breadcrumbLd([
            { name: "Home", url: "https://senscode.com/" },
            { name: "Blog", url: "https://senscode.com/blog" },
            {
              name: author.name,
              url: `https://senscode.com/blog/author/${slug}`,
            },
          ]),
          {
            "@type": "Person",
            name: author.name,
            description: author.bio,
            url: `https://senscode.com/blog/author/${slug}`,
            image: author.avatar?.asset
              ? urlFor(author.avatar).width(400).height(400).url()
              : undefined,
          },
        ]}
      />

      <header className="hero">
        <div className="hero-content reveal author-hero">
          {author.avatar?.asset ? (
            <Image
              src={urlFor(author.avatar).width(240).height(240).url()}
              alt={author.name}
              width={120}
              height={120}
              className="author-hero-avatar"
            />
          ) : null}
          <div>
            <span className="tag">Author</span>
            <h1>{author.name}.</h1>
            {author.bio ? <p>{author.bio}</p> : null}
            {socialLinks.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 16,
                  flexWrap: "wrap",
                }}
              >
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button small-btn"
                    style={{ background: "transparent" }}
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="panel">
        {posts.length === 0 ? (
          <div
            className="card glass-panel no-spotlight"
            style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}
          >
            <h2>No posts yet.</h2>
            <p className="card-desc">
              {author.name} hasn&apos;t shipped any posts.{" "}
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
