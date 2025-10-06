import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  doublePrecision,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const bank_accounts = pgTable("bank_accounts", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  account_number: varchar("account_number", { length: 34 }).notNull().unique(),
  balance: doublePrecision("balance").notNull().default(0),
  created_at: timestamp("created_at").defaultNow(),
});

export const business_accounts = pgTable("business_accounts", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  bank_account_id: text("bank_account_id")
    .notNull()
    .references(() => bank_accounts.id),
  wallet_balance: doublePrecision("wallet_balance").notNull().default(0),
  created_at: timestamp("created_at").defaultNow(),
});

export const investor_accounts = pgTable("investor_accounts", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  bank_account_id: text("bank_account_id")
    .notNull()
    .references(() => bank_accounts.id),
  wallet_balance: doublePrecision("wallet_balance").notNull().default(0),
  created_at: timestamp("created_at").defaultNow(),
});

export const business_pitches = pgTable("business_pitches", {
  instance_id: text("instance_id").primaryKey().default(sql`gen_random_uuid()::text`),
  pitch_id: text("pitch_id").default(sql`gen_random_uuid()::text`).notNull(),
  version: integer("version").notNull().default(1),
  business_account_id: text("business_account_id")
    .notNull()
    .references(() => business_accounts.id),

  status: varchar("status", { length: 50 }).notNull(),

  product_title: text("product_title").notNull(),
  elevator_pitch: text("elevator_pitch").notNull(),
  detailed_pitch: text("detailed_pitch").notNull(),
  supporting_media: text("supporting_media"),

  target_investment_amount: doublePrecision("target_investment_amount").notNull(),
  raised_amount: doublePrecision("raised_amount").notNull().default(0),
  investor_profit_share_percent: doublePrecision("investor_profit_share_percent").notNull(),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),

  bronze_multiplier: doublePrecision("bronze_multiplier").notNull(),
  silver_multiplier: doublePrecision("silver_multiplier").notNull(),
  gold_multiplier: doublePrecision("gold_multiplier").notNull(),

  silver_threshold: doublePrecision("silver_threshold").notNull(),
  gold_threshold: doublePrecision("gold_threshold").notNull(),

  dividend_payout_period: varchar("dividend_payout_period", { length: 50 }).notNull(),
  next_payout_date: timestamp("next_payout_date"),

  tags: text("tags").array(),

  created_at: timestamp("created_at").defaultNow(),
});

export const investment_ledger = pgTable("investment_ledger", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  investor_id: text("investor_id")
    .notNull()
    .references(() => investor_accounts.id),
  pitch_id: text("pitch_id")
    .notNull()
    .references(() => business_pitches.instance_id),
  tier: varchar("tier", { length: 10 }).notNull(),
  amount_invested: doublePrecision("amount_invested").notNull(),
  shares_allocated: doublePrecision("shares_allocated").notNull(),
  investment_date: timestamp("investment_date").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  account_type: varchar("account_type", { length: 20 }).notNull(),
  account_id: text("account_id").notNull(),
  txn_type: varchar("txn_type", { length: 50 }).notNull(),
  related_pitch_id: text("related_pitch_id").references(() => business_pitches.instance_id),
  amount: doublePrecision("amount").notNull(),
  description: text("description"),
  success: boolean("success").default(true),
  created_at: timestamp("created_at").defaultNow(),
});
