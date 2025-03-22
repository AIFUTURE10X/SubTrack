import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("AUD"),
  billingCycle: text("billing_cycle").notNull().default("Monthly"),
  nextPaymentDate: timestamp("next_payment_date").notNull(),
  status: text("status").notNull().default("Active"),
  notes: text("notes"),
  icon: text("icon").default("sync-alt"),
  iconColor: text("icon_color").default("#3B82F6"),
});

export const paymentHistory = pgTable("payment_history", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("AUD"),
  status: text("status").notNull().default("Paid"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
});

export const insertPaymentHistorySchema = createInsertSchema(paymentHistory).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export type InsertPaymentHistory = z.infer<typeof insertPaymentHistorySchema>;
export type PaymentHistory = typeof paymentHistory.$inferSelect;

// Define enums for use in the app
export const BillingCycleEnum = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
} as const;

export const StatusEnum = {
  ACTIVE: "Active",
  PAUSED: "Paused",
} as const;

export const CurrencyEnum = {
  AUD: "AUD",
  USD: "USD",
  EUR: "EUR",
  GBP: "GBP",
} as const;
