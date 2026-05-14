import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { countOrdersForClient, getClientById } from "@/lib/orders";
import { formatDate } from "@/lib/format";
import { EditClientForm } from "./EditClientForm";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwner();
  const { id } = await params;

  const client = await getClientById(id);
  if (!client) notFound();

  const orderCount = await countOrdersForClient(client.id);

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>{client.name || client.email}</h1>
          <p>
            {client.email} · joined {formatDate(client.createdAt)} · {orderCount}{" "}
            {orderCount === 1 ? "order" : "orders"}
          </p>
        </div>
        <Link
          href="/dashboard/clients"
          style={{ opacity: 0.7, fontSize: "0.95rem" }}
        >
          ← All clients
        </Link>
      </div>

      <EditClientForm client={client} />
    </>
  );
}
