import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { getLead } from "@/lib/leads";
import type { QuoteData } from "@/db/schema";
import { QuoteForm } from "./QuoteForm";

export default async function LeadQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireOwner();
  const lead = await getLead(id);
  if (!lead) notFound();

  const existingQuote = (lead.quoteData ?? null) as QuoteData | null;

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>{existingQuote ? "Edit quote" : "Draft quote"}</h1>
          <p>
            For <strong>{lead.name || lead.email}</strong>. Save it to generate
            a shareable link.
          </p>
        </div>
        <Link
          href={`/dashboard/leads/${id}`}
          style={{ opacity: 0.7, fontSize: "0.95rem" }}
        >
          ← Back to lead
        </Link>
      </div>

      <section style={{ maxWidth: 720 }}>
        <QuoteForm
          leadId={id}
          initialTitle={
            existingQuote?.title || `Project for ${lead.name || lead.email}`
          }
          initialDescription={existingQuote?.description || ""}
          initialItems={existingQuote?.items || []}
        />
      </section>
    </>
  );
}
