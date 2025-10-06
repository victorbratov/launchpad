import {
  bank_accounts,
  business_accounts,
  investor_accounts,
  business_pitches,
  investment_ledger,
  transactions,
} from "./schema";

import {
  InferSelectModel,
  InferInsertModel,
} from "drizzle-orm";

export type BankAccount = InferSelectModel<typeof bank_accounts>;
export type NewBankAccount = InferInsertModel<typeof bank_accounts>;

export type BusinessAccount = InferSelectModel<typeof business_accounts>;
export type NewBusinessAccount = InferInsertModel<typeof business_accounts>;

export type InvestorAccount = InferSelectModel<typeof investor_accounts>;
export type NewInvestorAccount = InferInsertModel<typeof investor_accounts>;

export type BusinessPitch = InferSelectModel<typeof business_pitches>;
export type NewBusinessPitch = InferInsertModel<typeof business_pitches>;

export type InvestmentRecord = InferSelectModel<typeof investment_ledger>;
export type NewInvestmentRecord = InferInsertModel<typeof investment_ledger>;

export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;

export type InvestmentTier = "Bronze" | "Silver" | "Gold";

export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "investment"
  | "dividend";
