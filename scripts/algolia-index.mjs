#!/usr/bin/env node
// Pushes the site's searchable content to Algolia.
// Usage: node scripts/algolia-index.mjs
// Reads ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY, ALGOLIA_INDEX_NAME from env or .env.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Tiny .env loader so we don't pull dotenv as a dep.
const envPath = join(ROOT, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const APP_ID = process.env.ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const INDEX = process.env.ALGOLIA_INDEX_NAME || "senscode_site";

if (!APP_ID || !ADMIN_KEY) {
  console.error(
    "Missing ALGOLIA_APP_ID or ALGOLIA_ADMIN_KEY. Copy .env.example to .env and fill them in."
  );
  process.exit(1);
}

// ---- Records --------------------------------------------------------------
// Each record gets a stable objectID so re-runs are idempotent (upsert, not
// duplicate). Update content here whenever the site copy changes, then re-run.

const records = [
  // FAQ — services page
  {
    objectID: "faq-frameworks",
    type: "faq",
    title: "Why no React or big frameworks?",
    content:
      "My clients hate waiting and I hate rewriting perfectly good code every 18 months. Vanilla HTML, CSS, and JavaScript is faster, lighter, and still going to work in 2030. Backend functionality can be handled if needed.",
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
      "Full-scope builds run 3 to 6 weeks depending on complexity. I don't over-promise because I actually have to ship it. Timeline gets locked in writing before we start.",
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
      "Yes and no — I can deploy it to Vercel, Netlify, or wherever you prefer, then hand over the login. You own it forever, no monthly platform fees from me. Hands-off hosting available for a fee.",
    url: "/services#faq",
    section: "FAQ",
  },
  {
    objectID: "faq-veteran-discount",
    type: "faq",
    title: "How does the veteran discount work?",
    content:
      "Honor system. If you've served, 15 percent comes off the final invoice. No paperwork, no verification. Active duty and veterans both qualify.",
    url: "/services#faq",
    section: "FAQ",
  },

  // Services
  {
    objectID: "service-fullscope",
    type: "service",
    title: "Full Scope",
    content:
      "Custom UI/UX design, full-stack development, responsive mobile design, SEO and performance tuning. From the ground up. Starting at $1000.",
    url: "/services",
    section: "Services",
  },
  {
    objectID: "service-consulting",
    type: "service",
    title: "Technical Consulting",
    content:
      "Architecture planning, technology stack selection, code review and audits, scalability strategy. Starting at $500 plus hourly.",
    url: "/services",
    section: "Services",
  },
  {
    objectID: "service-repair",
    type: "service",
    title: "Website Repair",
    content:
      "Performance optimization, bug squashing and refactoring, design modernization, accessibility compliance. Starting at $300.",
    url: "/services",
    section: "Services",
  },
  {
    objectID: "service-ecommerce",
    type: "service",
    title: "E-commerce Architecture",
    content:
      "Secure payment gateways, inventory management, custom product flows. Add-on capability.",
    url: "/services",
    section: "Services",
  },
  {
    objectID: "service-animations",
    type: "service",
    title: "Kinetic and 3D Animations",
    content:
      "WebGL, custom physics, interactive particle canvases, scroll-driven motion.",
    url: "/services",
    section: "Services",
  },
  {
    objectID: "service-cms",
    type: "service",
    title: "Custom CMS Integration",
    content:
      "Manage your own content without touching code. Headless CMS or custom admin.",
    url: "/services",
    section: "Services",
  },
  {
    objectID: "service-seo",
    type: "service",
    title: "Advanced SEO and Analytics",
    content:
      "Deep structural optimization, schema markup, tracking integration, Core Web Vitals tuning.",
    url: "/services",
    section: "Services",
  },

  // Comparison rows — surface for queries like "subscription cost" or "ownership"
  {
    objectID: "compare-performance",
    type: "comparison",
    title: "Performance: Hand-Coded vs Builders",
    content:
      "Sub-second loads tuned per browser engine versus bloated runtime with dozens of unused scripts. Theme marketplaces ship whatever the original author shipped.",
    url: "/services#comparison-panel",
    section: "Comparison",
  },
  {
    objectID: "compare-ownership",
    type: "comparison",
    title: "Ownership and long-term cost",
    content:
      "You own every line and can host anywhere. Builders make you rent — leave the platform, lose the site. Pay once instead of monthly subscriptions forever.",
    url: "/services#comparison-panel",
    section: "Comparison",
  },
  {
    objectID: "compare-support",
    type: "comparison",
    title: "Support: who picks up the phone",
    content:
      "The person who built it picks up the phone. Versus tier-1 ticket queues with scripted replies, or theme authors who moved on three versions ago.",
    url: "/services#comparison-panel",
    section: "Comparison",
  },

  // High-level pages
  {
    objectID: "page-contact",
    type: "page",
    title: "Contact SensCode",
    content:
      "Start your project. Get a quote. Ask about retainers, custom builds, repairs, consulting, or veteran discount.",
    url: "/contact",
    section: "Contact",
  },
  {
    objectID: "page-portfolio",
    type: "page",
    title: "Portfolio and Case Studies",
    content:
      "Recent work, builds, and case studies. See examples of hand-coded sites in production.",
    url: "/portfolio",
    section: "Work",
  },
  {
    objectID: "page-about",
    type: "page",
    title: "About SensCode",
    content:
      "USMC veteran-owned web development studio in Yuma, Arizona. Designed, coded, and deployed by Christian Sparks.",
    url: "/about",
    section: "About",
  },
];

// ---- Synonyms -------------------------------------------------------------
// Bidirectional: searching ANY word in a group returns hits for ALL words.
// Add new groups here and re-run the indexer; old groups get wiped on push.

const synonymGroups = [
  // Veteran / military / armed forces — drives the 15% discount FAQ + about
  [
    "veteran",
    "veterans",
    "vet",
    "military",
    "armed forces",
    "service member",
    "active duty",
    "usmc",
    "marine",
    "marines",
    "army",
    "navy",
    "air force",
    "usaf",
    "coast guard",
    "soldier",
    "sailor",
    "reservist",
    "national guard",
    "veteran-owned",
  ],

  // Repair / fix-it / modernization — Repair service
  [
    "repair",
    "repairs",
    "fix",
    "fixes",
    "fixing",
    "broken",
    "bug",
    "bugs",
    "debug",
    "troubleshoot",
    "outdated",
    "revamp",
    "refresh",
    "restore",
    "modernize",
    "redesign",
    "makeover",
    "overhaul",
    "refactor",
    "upgrade",
  ],

  // Build-from-scratch / new project — Full Scope service
  [
    "build",
    "develop",
    "create",
    "make",
    "new site",
    "new website",
    "from scratch",
    "ground up",
    "full scope",
    "launch",
    "ship",
    "kick off",
    "brand new",
    "fresh build",
    "start a project",
  ],

  // Consulting / advisory — Consulting service
  [
    "consult",
    "consulting",
    "consultation",
    "advice",
    "advisor",
    "advisory",
    "audit",
    "code review",
    "evaluate",
    "assessment",
    "strategy",
    "architecture",
    "plan",
    "blueprint",
    "guidance",
    "mentor",
    "technical review",
  ],

  // E-commerce — services + estimator
  [
    "ecommerce",
    "e-commerce",
    "online store",
    "online shop",
    "shop",
    "shopping",
    "cart",
    "checkout",
    "payments",
    "stripe",
    "paypal",
    "sell online",
    "products",
    "inventory",
    "store",
  ],

  // Performance / speed — comparison + service
  [
    "fast",
    "speed",
    "performance",
    "quick",
    "lighthouse",
    "core web vitals",
    "page speed",
    "lag",
    "laggy",
    "slow",
    "optimize",
    "optimization",
    "faster",
    "speed up",
    "snappy",
    "responsive load",
  ],

  // Pricing / budget / cost
  [
    "cost",
    "price",
    "pricing",
    "cheap",
    "affordable",
    "budget",
    "rate",
    "money",
    "how much",
    "value",
    "worth",
    "fee",
    "fees",
    "rates",
    "expensive",
  ],

  // Contact / hire intent — Contact page
  [
    "contact",
    "reach out",
    "email",
    "message",
    "hire",
    "get in touch",
    "inquire",
    "inquiry",
    "book",
    "appointment",
    "call",
    "talk",
    "chat",
    "schedule",
    "work with",
  ],

  // Mobile / responsive
  [
    "mobile",
    "responsive",
    "phone",
    "tablet",
    "smartphone",
    "device",
    "iphone",
    "ipad",
    "android",
    "touch",
    "touchscreen",
    "mobile-friendly",
    "mobile first",
  ],

  // SEO / discoverability
  [
    "seo",
    "search engine",
    "google ranking",
    "discoverability",
    "schema",
    "rank",
    "ranking",
    "google",
    "search results",
    "organic",
    "traffic",
    "visibility",
    "findable",
    "metadata",
    "open graph",
  ],

  // Geo — Yuma / Arizona
  [
    "yuma",
    "arizona",
    "az",
    "southwest",
    "southern arizona",
    "desert",
    "usa",
    "united states",
    "america",
    "american",
    "stateside",
  ],

  // Generic web vocabulary — broad fallback
  [
    "web",
    "website",
    "websites",
    "site",
    "sites",
    "web app",
    "webapp",
    "web application",
    "application",
    "online presence",
    "digital presence",
    "homepage",
    "landing page",
  ],

  // Design / UI / UX
  [
    "design",
    "ui",
    "ux",
    "ui/ux",
    "user interface",
    "user experience",
    "look and feel",
    "aesthetic",
    "visual",
    "graphic design",
    "branding",
    "brand",
    "identity",
    "logo",
    "style guide",
  ],

  // Animation / motion / kinetic — Kinetic & 3D Animations service
  [
    "animation",
    "animations",
    "motion",
    "animated",
    "kinetic",
    "interactive",
    "scroll effects",
    "particle effects",
    "webgl",
    "3d",
    "three.js",
    "transitions",
    "smooth scroll",
    "parallax",
    "lottie",
  ],

  // CMS / content — Custom CMS Integration service
  [
    "cms",
    "content management",
    "headless",
    "manage content",
    "blog",
    "articles",
    "posts",
    "contentful",
    "sanity",
    "strapi",
    "wordpress",
    "ghost",
    "directus",
    "payload",
  ],

  // Hosting / deployment — FAQ mentions Vercel/Netlify
  [
    "host",
    "hosting",
    "deploy",
    "deployment",
    "vercel",
    "netlify",
    "cloudflare",
    "aws",
    "server",
    "dns",
    "domain",
    "cdn",
    "ssl",
    "https",
  ],

  // Vanilla / no-framework — FAQ "Why no React"
  [
    "vanilla",
    "javascript",
    "js",
    "html",
    "css",
    "no framework",
    "no react",
    "framework-free",
    "lightweight",
    "plain js",
    "plain javascript",
    "raw js",
    "raw html",
    "no jquery",
  ],

  // Hand-coded vs builders / no-code — comparison panel
  [
    "hand-coded",
    "hand coded",
    "custom",
    "custom built",
    "bespoke",
    "tailored",
    "no-code",
    "low-code",
    "drag and drop",
    "drag-and-drop",
    "page builder",
    "wix",
    "squarespace",
    "weebly",
    "themeforest",
    "envato",
    "shopify themes",
    "site builder",
    "template",
  ],

  // Owner / Christian Sparks — about page
  [
    "christian",
    "sparks",
    "christian sparks",
    "founder",
    "owner",
    "developer",
    "dev",
    "programmer",
    "engineer",
    "freelancer",
    "solo",
    "one person",
    "the agency",
    "marine veteran",
  ],

  // Timeline / how long — FAQ
  [
    "timeline",
    "deadline",
    "when",
    "how long",
    "weeks",
    "eta",
    "timeframe",
    "milestone",
    "deliverable",
    "duration",
    "turnaround",
    "delivery",
    "completion date",
  ],

  // Quote / proposal / inquiry
  [
    "quote",
    "estimate",
    "free quote",
    "proposal",
    "contract",
    "sow",
    "statement of work",
    "bid",
    "agreement",
    "scope",
    "discovery call",
  ],

  // Maintenance / retainer — FAQ "after launch"
  [
    "maintenance",
    "maintain",
    "ongoing support",
    "retainer",
    "ongoing",
    "monthly support",
    "support plan",
    "long-term support",
    "after launch",
    "post-launch",
    "updates",
  ],

  // Portfolio / work / case studies
  [
    "portfolio",
    "work",
    "projects",
    "examples",
    "samples",
    "case study",
    "case studies",
    "previous work",
    "past work",
    "showcase",
    "demos",
    "client work",
  ],

  // Accessibility / a11y / WCAG — services + repair
  [
    "accessibility",
    "a11y",
    "accessible",
    "wcag",
    "aria",
    "keyboard navigation",
    "screen reader",
    "ada",
    "ada compliance",
    "508 compliance",
    "color contrast",
    "alt text",
    "inclusive",
  ],

  // Project size / scope
  [
    "small project",
    "big project",
    "large project",
    "simple site",
    "complex site",
    "enterprise",
    "startup",
    "side project",
    "passion project",
    "mvp",
    "prototype",
    "proof of concept",
  ],

  // Privacy / terms / legal pages
  [
    "privacy",
    "privacy policy",
    "data",
    "gdpr",
    "ccpa",
    "terms",
    "terms of service",
    "terms of use",
    "tos",
    "legal",
    "policy",
    "cookies",
  ],

  // Quality / craftsmanship signals
  [
    "quality",
    "well-built",
    "well built",
    "professional",
    "craft",
    "craftsmanship",
    "polished",
    "premium",
    "high-end",
    "high end",
    "boutique",
    "studio",
  ],
];

// ---- Algolia REST calls ---------------------------------------------------

const base = `https://${APP_ID}-dsn.algolia.net/1/indexes/${INDEX}`;
const headers = {
  "X-Algolia-API-Key": ADMIN_KEY,
  "X-Algolia-Application-Id": APP_ID,
  "Content-Type": "application/json",
};

async function call(path, method, body) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(
      `${method} ${path} failed: ${res.status} ${await res.text()}`
    );
  }
  return res.json();
}

async function batchUpsert(items) {
  const requests = items.map((body) => ({ action: "updateObject", body }));
  return call("/batch", "POST", { requests });
}

async function pushSynonyms(groups) {
  const synonyms = groups.map((words, i) => ({
    objectID: `synonym-group-${i}`,
    type: "synonym",
    synonyms: words,
  }));
  // replaceExistingSynonyms wipes any prior entries so re-runs stay clean.
  return call("/synonyms/batch?replaceExistingSynonyms=true", "POST", synonyms);
}

async function setSettings() {
  return call("/settings", "PUT", {
    searchableAttributes: [
      "unordered(title)",
      "unordered(content)",
      "unordered(section)",
    ],
    attributesForFaceting: ["filterOnly(type)", "searchable(section)"],
    customRanking: ["asc(type)"],
    attributesToHighlight: ["title", "content"],
    attributesToSnippet: ["content:24"],
    snippetEllipsisText: "…",
    typoTolerance: true,
    removeStopWords: true,
    advancedSyntax: true,
  });
}

(async () => {
  console.log(`Pushing ${records.length} records to ${INDEX}…`);
  await batchUpsert(records);
  console.log("Records uploaded. Configuring index settings…");
  await setSettings();
  console.log(`Pushing ${synonymGroups.length} synonym groups…`);
  await pushSynonyms(synonymGroups);
  console.log("Done. Test in the browser modal or the Algolia dashboard.");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
