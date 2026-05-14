// Pushes searchable content to Algolia.
// Usage: npm run index
//
// Reads ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY, ALGOLIA_INDEX_NAME from .env.local,
// plus NEXT_PUBLIC_SANITY_* for fetching published blog posts.
//
// Run after:
//   - Publishing or editing a blog post in Sanity Studio
//   - Renaming pages, rewriting copy, or shipping new top-level features
//
// Uses Algolia's REST batch API directly (no SDK dep). Records upsert by
// objectID, so re-runs idempotently update existing entries.

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@sanity/client";

type Record = {
  objectID: string;
  type: "page" | "blog" | "faq" | "service" | "account";
  title: string;
  content: string;
  url: string;
  section: string;
};

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const INDEX = process.env.NEXT_PUBLIC_ALGOLIA_INDEX || "senscode_site";

const missing: string[] = [];
if (!APP_ID) missing.push("NEXT_PUBLIC_ALGOLIA_APP_ID");
if (!ADMIN_KEY) missing.push("ALGOLIA_ADMIN_KEY");
if (missing.length || !APP_ID || !ADMIN_KEY) {
  console.error(`Missing ${missing.join(" + ")} in .env.local.`);
  if (missing.includes("ALGOLIA_ADMIN_KEY")) {
    console.error(
      "Get the Admin API Key from algolia.com → API Keys (the one with all permissions),",
    );
    console.error("paste it as ALGOLIA_ADMIN_KEY=... and re-run.");
  }
  process.exit(1);
}

// ---- Static records --------------------------------------------------------
// Pages, services, FAQs, account access. Update whenever copy changes
// materially; otherwise re-runs are idempotent.

const STATIC_RECORDS: Record[] = [
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

// ---- Pull blog posts from Sanity ------------------------------------------

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const SANITY_API_VERSION =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-12-01";

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

// Flatten portable text blocks to a single string for indexing — strips
// marks, links, images, code blocks. Just the words.
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

async function fetchBlogPosts(): Promise<Record[]> {
  if (!SANITY_PROJECT_ID) {
    console.warn("Sanity not configured — skipping blog post records.");
    return [];
  }

  const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
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
    // Cap body excerpt to ~600 chars so the index stays light and the
    // snippet shown in search results focuses on the leading paragraphs.
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

// ---- Algolia REST calls ----------------------------------------------------

const base = `https://${APP_ID}-dsn.algolia.net/1/indexes/${INDEX}`;
const headers = {
  "X-Algolia-API-Key": ADMIN_KEY,
  "X-Algolia-Application-Id": APP_ID,
  "Content-Type": "application/json",
};

async function call(path: string, method: string, body?: unknown) {
  const res = await fetch(`${base}${path}`, {
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

async function batchUpsert(items: Record[]) {
  const requests = items.map((body) => ({ action: "updateObject", body }));
  return call("/batch", "POST", { requests });
}

async function setSettings() {
  return call("/settings", "PUT", {
    searchableAttributes: [
      "unordered(title)",
      "unordered(content)",
      "unordered(section)",
    ],
    attributesForFaceting: ["filterOnly(type)", "searchable(section)"],
    // Account + blog records float to the top when relevant; FAQs stay
    // available but de-prioritized vs first-class pages.
    customRanking: ["asc(type)"],
    attributesToHighlight: ["title", "content"],
    attributesToSnippet: ["content:28"],
    snippetEllipsisText: "…",
    typoTolerance: true,
    removeStopWords: true,
    advancedSyntax: true,
  });
}

// ---- Main ------------------------------------------------------------------

async function main() {
  const blogRecords = await fetchBlogPosts();
  const allRecords = [...STATIC_RECORDS, ...blogRecords];

  console.log(
    `Indexing ${allRecords.length} records (${STATIC_RECORDS.length} static + ${blogRecords.length} blog) → ${INDEX}`,
  );
  await batchUpsert(allRecords);
  console.log("Records uploaded. Updating index settings…");
  await setSettings();
  console.log("Done. Test in the site search modal or the Algolia dashboard.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
