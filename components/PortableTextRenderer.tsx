import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import type { Image as SanityImage } from "sanity";

type ImageBlock = SanityImage & {
  alt?: string;
  caption?: string;
};

type LinkMark = {
  href: string;
};

type CodeBlock = {
  code: string;
  language?: string;
  filename?: string;
};

const components: PortableTextComponents = {
  types: {
    image: ({ value }: { value: ImageBlock }) => {
      if (!value?.asset?._ref) return null;
      const url = urlFor(value).width(1600).quality(85).url();
      return (
        <figure style={{ margin: "2rem 0" }}>
          <Image
            src={url}
            alt={value.alt || ""}
            width={1600}
            height={900}
            sizes="(max-width: 768px) 100vw, 800px"
            style={{ width: "100%", height: "auto", borderRadius: 12 }}
          />
          {value.caption ? (
            <figcaption
              style={{
                opacity: 0.7,
                fontSize: "0.9rem",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
    code: ({ value }: { value: CodeBlock }) => (
      <pre
        style={{
          background: "rgb(0 0 0 / 35%)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 16,
          overflowX: "auto",
          fontSize: "0.9rem",
        }}
      >
        <code className={value.language ? `language-${value.language}` : ""}>
          {value.code}
        </code>
      </pre>
    ),
  },
  marks: {
    link: ({ value, children }: { value?: LinkMark; children: React.ReactNode }) => {
      const href = value?.href || "#";
      const isInternal = href.startsWith("/");
      if (isInternal) {
        return (
          <Link href={href} style={{ color: "var(--link)" }}>
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--link)" }}
        >
          {children}
        </a>
      );
    },
    code: ({ children }) => (
      <code
        style={{
          background: "rgb(255 255 255 / 8%)",
          padding: "2px 6px",
          borderRadius: 4,
          fontSize: "0.9em",
        }}
      >
        {children}
      </code>
    ),
  },
};

export function PortableTextRenderer({ value }: { value: unknown }) {
  if (!value) return null;
  // The Sanity Portable Text shape isn't easily expressed in our types here;
  // PortableText is happy with the raw block array.
  return (
    <PortableText
      value={value as Parameters<typeof PortableText>[0]["value"]}
      components={components}
    />
  );
}
