// Shared indexer used by both the CLI (`npm run index`) and the Sanity
// webhook endpoint (`/api/algolia-reindex`). Pulls Sanity posts, merges
// with static page records, and pushes the whole set to Algolia.

import { createClient } from "@sanity/client";

export type IndexRecord = {
  objectID: string;
  type: "page" | "blog" | "faq" | "service" | "account";
  title: string;
  content: string;
  url: string;
  section: string;
};

export type ReindexResult = {
  static: number;
  blog: number;
  total: number;
};

// ---- Static records --------------------------------------------------------
// Pages, services, FAQs, account access. Update whenever copy changes
// materially; otherwise re-runs are idempotent.

export const STATIC_RECORDS: IndexRecord[] = [
  // --- Top-level pages ---
  {
    objectID: "page-home",
    type: "page",
    title: "SensCode — Premium Web Design",
    content:
      "Hand-coded web design and development by Christian Sparks. USMC veteran-owned studio in Yuma, Arizona. Modern stack, no templates, no drag-and-drop builders.",
    url: "/",
    section: "Home",
  },
  {
    objectID: "page-about",
    type: "page",
    title: "About SensCode",
    content:
      "Christian Sparks, founder of SensCode. USMC veteran, full-stack engineer, building intentional websites with measured dependencies and uncompromising performance.",
    url: "/about",
    section: "About",
  },
  {
    objectID: "page-services",
    type: "page",
    title: "Services — Full Scope, Consulting, Repair",
    content:
      "Full Scope web development, technical consulting, and website repair. Hand-coded, performance-tuned, fully owned by the client. No platform lock-in.",
    url: "/services",
    section: "Services",
  },
  {
    objectID: "page-portfolio",
    type: "page",
    title: "Portfolio",
    content:
      "Selected client work and engineering case studies showing what hand-coded sites on a modern stack actually look like in production.",
    url: "/portfolio",
    section: "Portfolio",
  },
  {
    objectID: "page-contact",
    type: "page",
    title: "Contact SensCode",
    content:
      "Start a project, ask a question, or book a discovery call. Direct line to Christian — no account managers, no ticket queue.",
    url: "/contact",
    section: "Contact",
  },
  {
    objectID: "page-blog",
    type: "page",
    title: "Blog — Field Notes",
    content:
      "Field notes, case studies, and rants from the SensCode workbench. Things learned the hard way, written down so you don't have to.",
    url: "/blog",
    section: "Blog",
  },

  // --- Account access ---
  {
    objectID: "page-signin",
    type: "account",
    title: "Sign in to your account",
    content:
      "Access your SensCode client dashboard — view project status, send messages, and check timelines. Account, login, sign in, signup, create account, client portal, dashboard.",
    url: "/signin",
    section: "Account",
  },

  // --- Services ---
  {
    objectID: "service-fullscope",
    type: "service",
    title: "Full Scope Build",
    content:
      "End-to-end web design and development from discovery through launch. Architecture, UI/UX, performance tuning, deployment. Starting at $1500.",
    url: "/services",
    section: "Services",
  },
  {
    objectID: "service-consulting",
    type: "service",
    title: "Technical Consulting",
    content:
      "Architecture planning, technology stack selection, code review, scalability strategy. Starting at $500 plus hourly.",
    url: "/services",
    section: "Services",
  },
  {
    objectID: "service-repair",
    type: "service",
    title: "Website Repair",
    content:
      "Performance optimization, bug squashing, refactoring, design modernization, accessibility compliance for underperforming sites. Starting at $300.",
    url: "/services",
    section: "Services",
  },

  // --- FAQs (kept in sync with services/page.tsx) ---
  {
    objectID: "faq-stack",
    type: "faq",
    title: "What stack do you build on, and why?",
    content:
      "Next.js, Tailwind, Sanity, and Postgres, deployed on Vercel. Boring, modern, built to still be supported in 2030. Ships fast, stays lean, survives platform churn. You own the codebase outright — no proprietary builder, no platform lock-in, no monthly ransom.",
    url: "/services#faq",
    section: "FAQ",
  },
  {
    objectID: "faq-agencies",
    type: "faq",
    title: "Do you work with agencies?",
    content:
      "I AM the agency. There is one of me. No project managers, no handoffs, no looping in a team. Marine Corps taught me how to ship with limited resources and a lot of caffeine.",
    url: "/services#faq",
    section: "FAQ",
  },
  {
    objectID: "faq-timeline",
    type: "faq",
    title: "How long does a project take?",
    content:
      "Full-scope builds run 3 to 6 weeks depending on complexity. I do not over-promise because I actually have to ship it. Timeline gets locked in writing before we start.",
    url: "/services#faq",
    section: "FAQ",
  },
  {
    objectID: "faq-after-launch",
    type: "faq",
    title: "What happens after launch?",
    content:
      "You own the code outright. I hand over the keys and stick around for questions. Retainers available for ongoing updates and maintenance. Portfolio rights retained unless you want it kept private.",
    url: "/services#faq",
    section: "FAQ",
  },
  {
    objectID: "faq-hosting",
    type: "faq",
    title: "Do you host the site?",
    content:
      "I can deploy to Vercel, Netlify, or wherever you prefer, then hand over the login. You own it forever, no strings attached, no monthly platform fees. Hands-off hosting available for a fee if you prefer.",
    url: "/services#faq",
    section: "FAQ",
  },
  {
    objectID: "faq-veteran",
    type: "faq",
    title: "How does the veteran discount work?",
    content:
      "Honor system. If you have served, 15% comes off the final invoice. No paperwork, no verification rituals — I trust my fellow service members.",
    url: "/services#faq",
    section: "FAQ",
  },
];

// ---- Portable Text → plain ------------------------------------------------

type SanityPost = {
  _id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: unknown;
  publishedAt?: string;
  author?: { name?: string };
  categories?: Array<{ title?: string }>;
};

function portableTextToPlain(body: unknown): string {
  if (!Array.isArray(body)) return "";
  const parts: string[] = [];
  for (const block of body) {
    if (
      block &&
      typeof block === "object" &&
      "_type" in block &&
      block._type === "block" &&
      "children" in block &&
      Array.isArray((block as { children: unknown }).children)
    ) {
      for (const child of (block as { children: Array<{ text?: string }> })
        .children) {
        if (child && typeof child.text === "string") parts.push(child.text);
      }
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

// ---- Fetch blog posts from Sanity ------------------------------------------

export async function fetchBlogPostRecords(): Promise<IndexRecord[]> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const apiVersion =
    process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-12-01";

  if (!projectId) return [];

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    perspective: "published",
  });

  const posts = await client.fetch<SanityPost[]>(
    `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      body,
      publishedAt,
      "author": author->{name},
      "categories": categories[]->{title}
    }`,
  );

  return posts.map((p) => {
    const slug = p.slug || p._id;
    const bodyPlain = portableTextToPlain(p.body).slice(0, 600);
    const author = p.author?.name ? ` By ${p.author.name}.` : "";
    const cats = p.categories?.length
      ? ` Categories: ${p.categories
          .map((c) => c.title)
          .filter(Boolean)
          .join(", ")}.`
      : "";
    return {
      objectID: `blog-${slug}`,
      type: "blog" as const,
      title: p.title || "(untitled)",
      content: [p.excerpt, bodyPlain, author + cats].filter(Boolean).join(" "),
      url: `/blog/${slug}`,
      section: "Blog",
    };
  });
}

// ---- Algolia REST ---------------------------------------------------------

function algoliaBase() {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const adminKey = process.env.ALGOLIA_ADMIN_KEY;
  const index = process.env.NEXT_PUBLIC_ALGOLIA_INDEX || "senscode_site";
  if (!appId || !adminKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_ALGOLIA_APP_ID or ALGOLIA_ADMIN_KEY. Add the admin key to env first.",
    );
  }
  return {
    url: `https://${appId}-dsn.algolia.net/1/indexes/${index}`,
    headers: {
      "X-Algolia-API-Key": adminKey,
      "X-Algolia-Application-Id": appId,
      "Content-Type": "application/json",
    },
    index,
  };
}

async function call(path: string, method: string, body?: unknown) {
  const { url, headers } = algoliaBase();
  const res = await fetch(`${url}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(
      `${method} ${path} failed: ${res.status} ${await res.text()}`,
    );
  }
  return res.json();
}

async function batchUpsert(items: IndexRecord[]) {
  const requests = items.map((body) => ({ action: "updateObject", body }));
  return call("/batch", "POST", { requests });
}

async function setIndexSettings() {
  return call("/settings", "PUT", {
    searchableAttributes: [
      "unordered(title)",
      "unordered(content)",
      "unordered(section)",
    ],
    attributesForFaceting: ["filterOnly(type)", "searchable(section)"],
    customRanking: ["asc(type)"],
    attributesToHighlight: ["title", "content"],
    attributesToSnippet: ["content:28"],
    snippetEllipsisText: "…",
    typoTolerance: true,
    removeStopWords: true,
    advancedSyntax: true,
  });
}

// ---- Public entry ---------------------------------------------------------

export async function runReindex(): Promise<ReindexResult> {
  const blogRecords = await fetchBlogPostRecords();
  const all = [...STATIC_RECORDS, ...blogRecords];
  await batchUpsert(all);
  await setIndexSettings();
  return {
    static: STATIC_RECORDS.length,
    blog: blogRecords.length,
    total: all.length,
  };
}
