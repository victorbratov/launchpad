"use server";

import { db } from "@/db";
import { bank_accounts, business_pitches, investment_ledger, investor_accounts, transactions } from "@/db/schema";
import { InvestmentRecord, InvestorAccount, Transaction, TransactionType } from "@/db/types";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";

export interface InvestmentEnriched extends InvestmentRecord {
  pitchTitle: string | null;
  pitchStatus: string | null;
}

export async function getInvestments(): Promise<InvestmentEnriched[]> {
  const { userId } = await auth();

  if (userId === null) {
    throw new Error("User not authenticated");
  }

  const investments = await db
    .select({
      pitch_id: investment_ledger.pitch_id,
      id: investment_ledger.id,
      investor_id: investment_ledger.investor_id,
      tier: investment_ledger.tier,
      amount_invested: investment_ledger.amount_invested,
      shares_allocated: investment_ledger.shares_allocated,
      investment_date: investment_ledger.investment_date,
      pitchTitle: business_pitches.product_title,
      pitchStatus: business_pitches.status,
    })
    .from(investment_ledger)
    .where(eq(investment_ledger.investor_id, userId))
    .leftJoin(business_pitches, eq(investment_ledger.pitch_id, business_pitches.instance_id))
    ;

  return investments;
}


export async function getInvestorInfo(): Promise<InvestorAccount> {
  const { userId } = await auth();

  if (userId === null) {
    throw new Error("User not authenticated");
  }

  const [investorInfo] = await db.select().from(investor_accounts).where(eq(investor_accounts.id, userId)).limit(1);

  if (investorInfo === undefined) {
    throw new Error("Investor account not found");
  }

  return investorInfo;
}

export async function getDividends(): Promise<Transaction[]> {
  const { userId } = await auth();

  if (userId === null) {
    throw new Error("User not authenticated");
  }

  const dividends = await db.select().from(transactions).where(and(eq(transactions.txn_type, "dividend"), eq(transactions.account_id, userId)));

  return dividends;
}

export const depositFunds = async (amount: number): Promise<void> => {
  const { userId } = await auth();

  if (userId === null) {
    throw new Error("User not authenticated");
  }

  const investorAccount = await getInvestorInfo();

  const [bankAccount] = await db.select().from(bank_accounts).where(eq(bank_accounts.id, investorAccount.bank_account_id)).limit(1);

  if (bankAccount === undefined) {
    throw new Error("Bank account not found");
  }

  if (bankAccount.balance < amount) {
    throw new Error("Insufficient funds in bank account");
  }

  await db.transaction(async (tx) => {
    await tx.update(bank_accounts).set({ balance: bankAccount.balance - amount }).where(eq(bank_accounts.id, bankAccount.id));
    await tx.update(investor_accounts).set({ wallet_balance: investorAccount.wallet_balance + amount }).where(eq(investor_accounts.id, investorAccount.id));
    await tx.insert(transactions).values({
      account_type: "investor",
      account_id: userId,
      txn_type: "deposit",
      tnx_status: "completed",
      amount
    });
  })
}

export const withdrawFunds = async (amount: number): Promise<void> => {
  const { userId } = await auth();

  if (userId === null) {
    throw new Error("User not authenticated");
  }

  const investorAccount = await getInvestorInfo();

  const [bankAccount] = await db.select().from(bank_accounts).where(eq(bank_accounts.id, investorAccount.bank_account_id)).limit(1);

  if (bankAccount === undefined) {
    throw new Error("Bank account not found");
  }

  if (investorAccount.wallet_balance < amount) {
    throw new Error("Insufficient funds in wallet");
  }

  await db.transaction(async (tx) => {
    await tx.update(bank_accounts).set({ balance: bankAccount.balance + amount }).where(eq(bank_accounts.id, bankAccount.id));
    await tx.update(investor_accounts).set({ wallet_balance: investorAccount.wallet_balance - amount }).where(eq(investor_accounts.id, investorAccount.id));
    await tx.insert(transactions).values({
      account_type: "investor",
      account_id: userId,
      txn_type: "withdrawal",
      tnx_status: "completed",
      amount
    });
  })
}

export const getTransactions = async (): Promise<Transaction[]> => {
  const { userId } = await auth();

  if (userId === null) {
    throw new Error("User not authenticated");
  }

  const transactionsList = await db.select().from(transactions).where(eq(transactions.account_id, userId)).orderBy(transactions.created_at);

  return transactionsList;
}
