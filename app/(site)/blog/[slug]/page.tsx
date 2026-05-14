import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllPostSlugs, getPostBySlug } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";
import { isConfigured } from "@/sanity/env";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";
import { JsonLd, ORGANIZATION_LD, breadcrumbLd } from "@/lib/jsonLd";

export const revalidate = 60;
export const dynamicParams = true;

type Params = { slug: string };

export async function generateStaticParams() {
  if (!isConfigured) return [];
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  const ogImage = post.coverImage
    ? urlFor(post.coverImage).width(1200).height(630).url()
    : "/og-card.png";
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author.name] : undefined,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.coverImage?.alt || post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        graph={[
          ORGANIZATION_LD,
          breadcrumbLd([
            { name: "Home", url: "https://senscode.com/" },
            { name: "Blog", url: "https://senscode.com/blog" },
            {
              name: post.title,
              url: `https://senscode.com/blog/${post.slug}`,
            },
          ]),
          {
            "@type": "BlogPosting",
            "@id": `https://senscode.com/blog/${post.slug}#post`,
            headline: post.title,
            datePublished: post.publishedAt,
            description: post.excerpt,
            image: post.coverImage
              ? urlFor(post.coverImage).width(1200).height(630).url()
              : "https://senscode.com/og-card.png",
            mainEntityOfPage: `https://senscode.com/blog/${post.slug}`,
            publisher: { "@id": "https://senscode.com/#organization" },
            author: post.author
              ? {
                  "@type": "Person",
                  name: post.author.name,
                  url: `https://senscode.com/about`,
                }
              : undefined,
          },
        ]}
      />

      <article className="panel">
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            paddingTop: "clamp(60px, 8vh, 120px)",
          }}
        >
          <Link
            href="/blog"
            style={{
              display: "inline-block",
              marginBottom: 24,
              opacity: 0.7,
              fontSize: "0.95rem",
            }}
          >
            ← All posts
          </Link>

          {post.categories?.length ? (
            <span className="tag">{post.categories[0].title}</span>
          ) : null}

          <h1 style={{ marginTop: 12 }}>{post.title}</h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 24,
              marginBottom: 40,
              opacity: 0.8,
              fontSize: "0.95rem",
            }}
          >
            {post.author?.avatar?.asset ? (
              <Image
                src={urlFor(post.author.avatar).width(80).height(80).url()}
                alt={post.author.name}
                width={40}
                height={40}
                style={{ borderRadius: "50%" }}
              />
            ) : null}
            <span>
              {post.author ? `${post.author.name} · ` : ""}
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
              {post.readTime ? ` · ${post.readTime} min read` : ""}
            </span>
          </div>

          {post.coverImage?.asset ? (
            <Image
              src={urlFor(post.coverImage).width(1600).quality(85).url()}
              alt={post.coverImage.alt || post.title}
              width={1600}
              height={900}
              sizes="(max-width: 768px) 100vw, 960px"
              priority
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 16,
                marginBottom: 40,
              }}
            />
          ) : null}

          <div
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.75,
            }}
          >
            <PortableTextRenderer value={post.body} />
          </div>

          {post.author?.bio ? (
            <div
              className="card glass-panel no-spotlight"
              style={{ marginTop: 60 }}
            >
              <span className="tag">About the Author</span>
              <h3 style={{ marginTop: 8 }}>{post.author.name}</h3>
              <p>{post.author.bio}</p>
            </div>
          ) : null}
        </div>
      </article>
    </>
  );
}
