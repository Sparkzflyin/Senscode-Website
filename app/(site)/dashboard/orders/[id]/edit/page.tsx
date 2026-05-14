import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { getOrderWithDetails, listClients } from "@/lib/orders";
import { EditOrderForm } from "./EditOrderForm";

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireOwner();
  const { id } = await params;

  const data = await getOrderWithDetails(id, {
    id: session.user.id,
    role: "owner",
  });
  if (!data) notFound();

  const clients = await listClients();

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>Edit order</h1>
          <p>{data.order.title}</p>
        </div>
        <Link
          href={`/dashboard/orders/${data.order.id}`}
          style={{ opacity: 0.7, fontSize: "0.95rem" }}
        >
          ← Back to order
        </Link>
      </div>

      <EditOrderForm order={data.order} clients={clients} />
    </>
  );
}
