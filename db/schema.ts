import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const userRole = pgEnum("user_role", ["owner", "client"]);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("passwordHash"),
  role: userRole("role").notNull().default("client"),
  canAuthorBlog: boolean("can_author_blog").notNull().default(false),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ----- Orders ---------------------------------------------------------------

export const orderStatus = pgEnum("order_status", [
  "new",
  "in_progress",
  "review",
  "completed",
  "on_hold",
  "cancelled",
]);

export const orders = pgTable("order", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  status: orderStatus("status").notNull().default("new"),
  // Money stored as integer cents to avoid floating-point drift. UI converts.
  totalCents: integer("total_cents").notNull().default(0),
  dueDate: timestamp("due_date", { mode: "date" }),
  // Owner-only internal notes. Never shown to the client.
  notes: text("notes"),
  clientId: text("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const orderItems = pgTable("order_item", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPriceCents: integer("unit_price_cents").notNull().default(0),
  position: integer("position").notNull().default(0),
});

export const orderUpdates = pgTable("order_update", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  // Optional — set when this entry represents a status change.
  statusChangedTo: orderStatus("status_changed_to"),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  // True = owner-only note, not visible to the client.
  isInternal: boolean("is_internal").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderUpdate = typeof orderUpdates.$inferSelect;
export type OrderStatus = (typeof orderStatus.enumValues)[number];

// ----- Site settings (singleton) --------------------------------------------
// One row, id="singleton". Holds owner-mutable knobs that surface on the
// public site — currently just the landing-page availability pill.

export const siteStatusColor = pgEnum("site_status_color", [
  "green",
  "yellow",
  "red",
]);

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey(),
  statusColor: siteStatusColor("status_color").notNull().default("green"),
  statusText: text("status_text")
    .notNull()
    .default("Accepting Booking Until June"),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export type SiteSettings = typeof siteSettings.$inferSelect;
export type SiteStatusColor = (typeof siteStatusColor.enumValues)[number];
