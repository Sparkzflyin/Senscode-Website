import { NextResponse } from "next/server";
import { runReindex } from "@/lib/algoliaIndexer";

// Triggered by a Sanity webhook on post create/update/delete. Configure
// the webhook in sanity.io/manage with:
//   URL:     https://senscode.com/api/algolia-reindex
//   Method:  POST
//   Headers: Authorization: Bearer <ALGOLIA_REINDEX_SECRET>
//   Trigger: filter on _type == "post"
//
// We do a full re-index on every call rather than parsing the webhook
// payload — Sanity sends the changed doc, but the catalog is small
// enough that pulling everything is faster than threading delta logic
// and stays correct under cascading updates (author rename, category
// rename, etc.).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.ALGOLIA_REINDEX_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "ALGOLIA_REINDEX_SECRET not configured." },
      { status: 503 },
    );
  }

  const auth = req.headers.get("authorization") || "";
  const expected = `Bearer ${secret}`;
  if (auth !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await runReindex();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[algolia-reindex] failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Reindex failed for unknown reason.",
      },
      { status: 500 },
    );
  }
}

// Optional GET so you can curl the endpoint to check it's mounted + alive.
// Returns 401 unless the same bearer is provided — keeps the surface tight.
export async function GET(req: Request) {
  const secret = process.env.ALGOLIA_REINDEX_SECRET;
  const auth = req.headers.get("authorization") || "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, message: "Send POST to reindex." });
}
