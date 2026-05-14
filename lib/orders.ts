import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orderItems, orders, orderUpdates, users } from "@/db/schema";
import type { OrderStatus } from "@/db/schema";

export type OrderListRow = {
  id: string;
  title: string;
  status: OrderStatus;
  totalCents: number;
  dueDate: Date | null;
  createdAt: Date;
  clientName: string | null;
  clientEmail: string;
};

export async function listOrdersForOwner(): Promise<OrderListRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: orders.id,
      title: orders.title,
      status: orders.status,
      totalCents: orders.totalCents,
      dueDate: orders.dueDate,
      createdAt: orders.createdAt,
      clientName: users.name,
      clientEmail: users.email,
    })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.clientId))
    .orderBy(desc(orders.createdAt));
  return rows;
}

export async function listOrdersForClient(
  clientId: string,
): Promise<OrderListRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: orders.id,
      title: orders.title,
      status: orders.status,
      totalCents: orders.totalCents,
      dueDate: orders.dueDate,
      createdAt: orders.createdAt,
      clientName: users.name,
      clientEmail: users.email,
    })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.clientId))
    .where(eq(orders.clientId, clientId))
    .orderBy(desc(orders.createdAt));
  return rows;
}

export async function getOrderWithDetails(
  orderId: string,
  viewer: { id: string; role: "owner" | "client" },
) {
  const db = getDb();
  const [order] = await db
    .select({
      id: orders.id,
      title: orders.title,
      description: orders.description,
      status: orders.status,
      totalCents: orders.totalCents,
      dueDate: orders.dueDate,
      notes: orders.notes,
      clientId: orders.clientId,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      clientName: users.name,
      clientEmail: users.email,
    })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.clientId))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) return null;

  // Clients can only see their own orders.
  if (viewer.role === "client" && order.clientId !== viewer.id) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .orderBy(asc(orderItems.position));

  // Clients never see internal updates. Owners see everything.
  const updates =
    viewer.role === "owner"
      ? await db
          .select()
          .from(orderUpdates)
          .where(eq(orderUpdates.orderId, orderId))
          .orderBy(desc(orderUpdates.createdAt))
      : await db
          .select()
          .from(orderUpdates)
          .where(
            and(
              eq(orderUpdates.orderId, orderId),
              eq(orderUpdates.isInternal, false),
            ),
          )
          .orderBy(desc(orderUpdates.createdAt));

  return { order, items, updates };
}

export async function listClients() {
  const db = getDb();
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "client"))
    .orderBy(asc(users.email));
}

export async function getClientById(clientId: string) {
  const db = getDb();
  const [client] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      canAuthorBlog: users.canAuthorBlog,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, clientId))
    .limit(1);
  if (!client || client.role !== "client") return null;
  return client;
}

export async function countOrdersForClient(clientId: string): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.clientId, clientId));
  return rows.length;
}
