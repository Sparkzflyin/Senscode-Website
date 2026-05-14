import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { leads } from "@/db/schema";
import type { LeadSource } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_SOURCES: LeadSource[] = ["contact", "estimator"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LeadBody = {
  source?: unknown;
  name?: unknown;
  email?: unknown;
  payload?: unknown;
};

export async function POST(req: Request) {
  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const source =
    typeof body.source === "string" &&
    (VALID_SOURCES as string[]).includes(body.source)
      ? (body.source as LeadSource)
      : null;
  if (!source) {
    return NextResponse.json(
      { error: "Invalid or missing `source`." },
      { status: 400 },
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Invalid or missing `email`." },
      { status: 400 },
    );
  }
  if (email.length > 250) {
    return NextResponse.json({ error: "Email too long." }, { status: 400 });
  }

  const name =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim().slice(0, 200)
      : null;

  const payload =
    body.payload && typeof body.payload === "object" && !Array.isArray(body.payload)
      ? (body.payload as Record<string, unknown>)
      : {};

  try {
    const db = getDb();
    const [created] = await db
      .insert(leads)
      .values({ source, name, email, payload })
      .returning({ id: leads.id });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (err) {
    console.error("[api/leads] insert failed:", err);
    return NextResponse.json(
      { error: "Could not save lead." },
      { status: 500 },
    );
  }
}
