import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  pgEnum,
  boolean,
  jsonb,
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

export const siteStatusMode = pgEnum("site_status_mode", ["manual", "auto"]);

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey(),
  statusMode: siteStatusMode("status_mode").notNull().default("manual"),
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
export type SiteStatusMode = (typeof siteStatusMode.enumValues)[number];

// ----- Leads ----------------------------------------------------------------
// Captures public form submissions (contact form + project estimator) so they
// surface in the owner dashboard inbox and can be converted to an order with
// one click. `payload` is the raw form snapshot — schema varies by source.

export const leadSource = pgEnum("lead_source", ["contact", "estimator"]);

export const leadStatus = pgEnum("lead_status", [
  "new",
  "contacted",
  "converted",
  "archived",
]);

export const leads = pgTable("lead", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  source: leadSource("source").notNull(),
  payload: jsonb("payload").notNull(),
  status: leadStatus("status").notNull().default("new"),
  convertedOrderId: text("converted_order_id").references(() => orders.id, {
    onDelete: "set null",
  }),
  // Quote workflow — owner drafts a proposal, generates a token, shares the
  // public URL /quote/[token]. Recipient hits "Accept" → creates the order.
  quoteToken: text("quote_token").unique(),
  quoteData: jsonb("quote_data"),
  quoteSentAt: timestamp("quote_sent_at", { mode: "date" }),
  quoteAcceptedAt: timestamp("quote_accepted_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type QuoteLineItem = {
  description: string;
  quantity: number;
  unitPriceCents: number;
};

export type QuoteData = {
  title: string;
  description?: string;
  items: QuoteLineItem[];
  totalCents: number;
};

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type LeadSource = (typeof leadSource.enumValues)[number];
export type LeadStatus = (typeof leadStatus.enumValues)[number];

// ----- Reviews / testimonials ------------------------------------------------
// Owner issues a tokenized review request from a completed order; the client
// visits /review/[token] and submits a rating + quote. Reviews don't go
// public until the owner toggles `approved`.

export const reviews = pgTable("review", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  rating: integer("rating"),
  quote: text("quote"),
  clientName: text("client_name"),
  clientRole: text("client_role"),
  submittedAt: timestamp("submitted_at", { mode: "date" }),
  approved: boolean("approved").notNull().default(false),
  approvedAt: timestamp("approved_at", { mode: "date" }),
  tokenIssuedAt: timestamp("token_issued_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
