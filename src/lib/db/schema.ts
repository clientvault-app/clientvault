import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  uuid,
  bigint,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const planEnum = pgEnum("plan", ["free", "pro", "agency"]);
export const portalStatusEnum = pgEnum("portal_status", [
  "active",
  "archived",
]);
export const fileStatusEnum = pgEnum("file_status", [
  "pending",
  "approved",
  "changes_requested",
]);
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
]);

// ============================================================
// Auth.js / NextAuth tables (required by @auth/drizzle-adapter)
// ============================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  // ClientVault-specific fields
  plan: planEnum("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  onboardingCompleted: boolean("onboarding_completed")
    .notNull()
    .default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })]);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (table) => [primaryKey({ columns: [table.identifier, table.token] })]);

// ============================================================
// ClientVault Business Tables
// ============================================================

export const portals = pgTable("portals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#6366f1"),
  status: portalStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  portalId: uuid("portal_id")
    .notNull()
    .references(() => portals.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  key: text("key"), // Storage key for deletion
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull().default(0),
  mimeType: text("mime_type"),
  status: fileStatusEnum("status").notNull().default("pending"),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileId: uuid("file_id").references(() => files.id, { onDelete: "cascade" }),
  portalId: uuid("portal_id")
    .notNull()
    .references(() => portals.id, { onDelete: "cascade" }),
  authorEmail: text("author_email").notNull(),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  portalId: uuid("portal_id")
    .notNull()
    .references(() => portals.id, { onDelete: "cascade" }),
  authorEmail: text("author_email").notNull(),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  portalId: uuid("portal_id")
    .notNull()
    .references(() => portals.id, { onDelete: "cascade" }),
  stripeInvoiceId: text("stripe_invoice_id"),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("usd"),
  description: text("description"),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  dueDate: timestamp("due_date", { mode: "date" }),
  paidAt: timestamp("paid_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// ============================================================
// Relations
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  portals: many(portals),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const portalsRelations = relations(portals, ({ one, many }) => ({
  user: one(users, { fields: [portals.userId], references: [users.id] }),
  files: many(files),
  comments: many(comments),
  messages: many(messages),
  invoices: many(invoices),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
  portal: one(portals, { fields: [files.portalId], references: [portals.id] }),
  uploader: one(users, { fields: [files.uploadedBy], references: [users.id] }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  file: one(files, { fields: [comments.fileId], references: [files.id] }),
  portal: one(portals, {
    fields: [comments.portalId],
    references: [portals.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  portal: one(portals, {
    fields: [messages.portalId],
    references: [portals.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  portal: one(portals, {
    fields: [invoices.portalId],
    references: [portals.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
