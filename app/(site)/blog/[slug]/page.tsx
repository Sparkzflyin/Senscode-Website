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

type AuthorSocial = NonNullable<
  NonNullable<
    Awaited<ReturnType<typeof getPostBySlug>>
  >["author"]
>["social"];

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  Website: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
    </svg>
  ),
  GitHub: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.12 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56 4.56-1.52 7.85-5.83 7.85-10.91C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  ),
  LinkedIn: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  ),
  Instagram: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
    </svg>
  ),
};

function AuthorSocialLinks({ social }: { social: AuthorSocial }) {
  const links: Array<{ label: string; href: string }> = [];
  if (social?.website) links.push({ label: "Website", href: social.website });
  if (social?.github) links.push({ label: "GitHub", href: social.github });
  if (social?.linkedin) links.push({ label: "LinkedIn", href: social.linkedin });
  if (social?.instagram)
    links.push({ label: "Instagram", href: social.instagram });
  if (links.length === 0) return null;

  return (
    <div className="author-social-row">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="author-social-link"
        >
          {SOCIAL_ICONS[link.label]}
        </a>
      ))}
    </div>
  );
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

          {post.author && (post.author.bio || post.author.social) ? (
            <div
              className="card glass-panel no-spotlight author-card"
              data-cursor="keep"
              style={{ marginTop: 60 }}
            >
              <span className="tag">About the Author</span>
              <h3 style={{ marginTop: 8 }}>{post.author.name}</h3>
              {post.author.bio ? <p>{post.author.bio}</p> : null}
              {post.author.social ? (
                <AuthorSocialLinks social={post.author.social} />
              ) : null}
            </div>
          ) : null}
        </div>
      </article>
    </>
  );
}
