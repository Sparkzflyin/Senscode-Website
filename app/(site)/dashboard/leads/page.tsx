import { requireOwner } from "@/lib/auth";
import { listLeads } from "@/lib/leads";
import { LeadsList } from "./LeadsList";

export default async function LeadsListPage() {
  await requireOwner();
  const rows = await listLeads();

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>Leads</h1>
          <p>Contact form and estimator submissions, newest first.</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="dashboard-empty">
          <p>
            No leads yet. Submissions to the contact form and project estimator
            will land here.
          </p>
        </div>
      ) : (
        <LeadsList rows={rows} />
      )}
    </>
  );
}
