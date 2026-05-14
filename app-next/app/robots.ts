import type { MetadataRoute } from "next";

const ALLOWED_BOTS = [
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
  "Slurp",
  "Applebot",
  // Generative / agentic crawlers — explicit allows so any future tightening
  // of the wildcard rule doesn't accidentally cut them off.
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "Diffbot",
  "cohere-ai",
  "cohere-training-data-crawler",
  "YouBot",
  "MistralAI-User",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...ALLOWED_BOTS.map((bot) => ({ userAgent: bot, allow: "/" })),
    ],
    sitemap: "https://senscode.com/sitemap.xml",
  };
}
