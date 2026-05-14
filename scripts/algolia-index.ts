// Pushes searchable content to Algolia.
// Usage: npm run index
//
// Reads ALGOLIA_ADMIN_KEY + NEXT_PUBLIC_ALGOLIA_* + NEXT_PUBLIC_SANITY_*
// from .env.local. Same code path as the /api/algolia-reindex webhook —
// both delegate to lib/algoliaIndexer.ts so they stay in sync.

import { config } from "dotenv";
config({ path: ".env.local" });

import { runReindex } from "../lib/algoliaIndexer";

async function main() {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const adminKey = process.env.ALGOLIA_ADMIN_KEY;
  const missing: string[] = [];
  if (!appId) missing.push("NEXT_PUBLIC_ALGOLIA_APP_ID");
  if (!adminKey) missing.push("ALGOLIA_ADMIN_KEY");
  if (missing.length) {
    console.error(`Missing ${missing.join(" + ")} in .env.local.`);
    if (missing.includes("ALGOLIA_ADMIN_KEY")) {
      console.error(
        "Get the Admin API Key from algolia.com → API Keys (all permissions),",
      );
      console.error("paste it as ALGOLIA_ADMIN_KEY=... and re-run.");
    }
    process.exit(1);
  }

  const index = process.env.NEXT_PUBLIC_ALGOLIA_INDEX || "senscode_site";
  console.log(`Indexing → ${index}`);
  const result = await runReindex();
  console.log(
    `Done. ${result.total} records (${result.static} static + ${result.blog} blog).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
