import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/sanity/lib/fetch";

export const alt = "SensCode blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function PostOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const title = post?.title ?? "SensCode";
  const authorName = post?.author?.name ?? "SensCode";
  const date = post?.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const category = post?.categories?.[0]?.title ?? "Field Notes";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "linear-gradient(135deg, #000 0%, #0a0a0a 45%, #1a1300 100%)",
          color: "#f5f5f7",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 85% 15%, rgba(255, 149, 0, 0.20) 0%, transparent 55%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: "#ff9500",
                boxShadow: "0 0 24px rgba(255, 149, 0, 0.7)",
              }}
            />
            <span
              style={{
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: 1.5,
              }}
            >
              SensCode
            </span>
          </div>
          <span
            style={{
              fontSize: 22,
              padding: "8px 18px",
              borderRadius: 999,
              border: "1px solid rgba(245, 245, 247, 0.25)",
              opacity: 0.85,
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            {category}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            maxWidth: "92%",
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontSize: title.length > 80 ? 60 : title.length > 40 ? 72 : 88,
              fontWeight: 700,
              lineHeight: 1.05,
              margin: 0,
              letterSpacing: -1.5,
            }}
          >
            {title}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 28,
              opacity: 0.8,
            }}
          >
            <span>{authorName}</span>
            {date ? (
              <>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>{date}</span>
              </>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            opacity: 0.55,
            zIndex: 1,
          }}
        >
          <span>senscode.com</span>
          <span>Read on the site →</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
