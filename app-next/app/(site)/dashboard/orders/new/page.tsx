import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { listClients } from "@/lib/orders";
import { NewOrderForm } from "./NewOrderForm";

export default async function NewOrderPage() {
  await requireOwner();
  const clients = await listClients();

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>New order</h1>
          <p>Create an order and assign it to a client.</p>
        </div>
        <Link href="/dashboard/orders" style={{ opacity: 0.7, fontSize: "0.95rem" }}>
          ← All orders
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="dashboard-empty">
          <p>
            You don&apos;t have any clients yet. Create one over at{" "}
            <Link href="/dashboard/clients" style={{ color: "var(--link)" }}>
              Clients
            </Link>{" "}
            first.
          </p>
        </div>
      ) : (
        <NewOrderForm clients={clients} />
      )}
    </>
  );
}
