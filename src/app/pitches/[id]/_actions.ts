"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  business_pitches,
  investor_accounts,
  investment_ledger,
  business_accounts,
  bank_accounts,
  transactions,
} from "@/db/schema";
import { BusinessPitch, NewInvestmentRecord, NewTransaction } from "@/db/types";
import { and, eq, sql } from "drizzle-orm";

/**
 * Get a pitch version by instance_id (a specific version).
 * @param instanceId - The version-specific ID of the pitch.
 */
export async function getPitchByInstanceId(instanceId: string): Promise<BusinessPitch | null> {
  const [pitch] = await db
    .select()
    .from(business_pitches)
    .where(eq(business_pitches.instance_id, instanceId))
    .limit(1);

  return pitch ?? null;
}

/**
 * Get all versions of a pitch by entity_id.
 * @param entityId The stable unique entity ID (shared across all versions).
 */
export async function getPitchVersions(entityId: string): Promise<BusinessPitch[]> {
  return await db
    .select()
    .from(business_pitches)
    .where(eq(business_pitches.pitch_id, entityId))
    .orderBy(business_pitches.version);
}

/**
 * Calculate total investments for a canonical pitch entity (across all versions).
 * @param entityId The canonical entity_id of the pitch.
 */
export async function getTotalMoneyInvestedInPitch(
  entityId: string
): Promise<{ pitch_id: string; totalAmount: number }> {
  const [row] = await db
    .select({
      pitch_id: investment_ledger.pitch_id,
      totalAmount: sql<number>`SUM(${investment_ledger.amount_invested})`.as("totalAmount"),
    })
    .from(investment_ledger)
    .where(eq(investment_ledger.pitch_id, entityId))
    .groupBy(investment_ledger.pitch_id);

  return row ?? { pitch_id: entityId, totalAmount: 0 };
}

/**
 * Handle investment into a pitch.
 *
 * Investments always attach to the canonical entity (entity_id), not the instance_id/version.
 */
export async function investInPitch(entityId: string, amount: number, withdrawChoice: "wallet" | "bank_account") {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");
  if (amount <= 0) throw new Error("Invalid investment amount");

  const [pitch] = await db
    .select()
    .from(business_pitches)
    .where(eq(business_pitches.instance_id, entityId))
    .limit(1);

  if (!pitch) throw new Error("Pitch not found");

  const [investor] = await db
    .select()
    .from(investor_accounts)
    .where(eq(investor_accounts.id, userId));

  if (!investor) throw new Error("Investor account not found");

  const [bank_account] = await db.select().from(bank_accounts).where(eq(bank_accounts.id, investor.bank_account_id)).limit(1);

  if (!bank_account) throw new Error("Bank account not found");

  if (withdrawChoice === "wallet" && investor.wallet_balance < amount) {
    throw new Error("Insufficient balance in wallet");
  }
  else if (withdrawChoice === "bank_account" && bank_account.balance < amount) {
    throw new Error("Insufficient balance in bank account");
  }

  if (pitch.status !== "active") {
    throw new Error("Cannot invest in a pitch that is not active");
  }

  if (pitch.raised_amount + amount > pitch.target_investment_amount) {
    throw new Error("Investment exceeds target amount");
  }

  const funded = (pitch.raised_amount + amount == pitch.target_investment_amount);
  const [existingInvestment] = await db.select().from(investment_ledger).where(and(eq(investment_ledger.pitch_id, pitch.instance_id), eq(investment_ledger.investor_id, investor.id))).limit(1);

  let investmentAmount = amount;

  if (existingInvestment) {
    investmentAmount = amount + existingInvestment.amount_invested;
  }

  let tier = "bronze";
  let multiplier = pitch.bronze_multiplier;
  if (investmentAmount > pitch.gold_threshold) {
    tier = "gold";
    multiplier = pitch.gold_multiplier;
  } else if (investmentAmount > pitch.silver_threshold) {
    tier = "silver";
    multiplier = pitch.silver_multiplier;
  }

  const shares = investmentAmount * multiplier;

  const investmentRecord: NewInvestmentRecord = {
    pitch_id: pitch.instance_id,
    investor_id: investor.id,
    tier: tier,
    amount_invested: amount,
    shares_allocated: shares,
  }

  const transactionRecord: NewTransaction = {
    amount: amount,
    account_id: investor.id,
    related_pitch_id: pitch.instance_id,
    txn_type: "investment",
    account_type: "investor",
    tnx_status: "pending",
    description: `Investment in ${pitch.product_title} (${tier} tier)`,
  }


  await db.transaction(async (tx) => {
    await tx.insert(transactions).values(transactionRecord);
    if (existingInvestment) {
      await tx.update(investment_ledger).set({
        amount_invested: sql`${investment_ledger.amount_invested} + ${amount}`,
        tier: tier,
        shares_allocated: shares,
      }).where(eq(investment_ledger.id, existingInvestment.id));
    } else {
      await tx.insert(investment_ledger).values(investmentRecord);
    }
    await tx.update(business_pitches).set({
      raised_amount: sql`${business_pitches.raised_amount} + ${amount}`,
    }).where(eq(business_pitches.instance_id, pitch.instance_id));
    if (withdrawChoice === "wallet") {
      await tx.update(investor_accounts).set({
        wallet_balance: sql`${investor_accounts.wallet_balance} - ${amount}`,
      }).where(eq(investor_accounts.id, investor.id));
    } else {
      await tx.update(bank_accounts).set({
        balance: sql`${bank_accounts.balance} - ${amount}`,
      }).where(eq(bank_accounts.id, bank_account.id));
    }
  })

  if (funded) {

    const fundingTransaction: NewTransaction = {
      amount: pitch.target_investment_amount,
      account_id: pitch.business_account_id,
      related_pitch_id: pitch.instance_id,
      account_type: "business",
      txn_type: "investment",
      tnx_status: "completed",
      description: `Pitch ${pitch.product_title} fully funded`,
    }

    await db.transaction(async (tx) => {
      await tx.update(business_pitches).set({
        status: "funded",
      }).where(eq(business_pitches.instance_id, pitch.instance_id));
      await tx.update(business_accounts).set({
        wallet_balance: sql`${business_accounts.wallet_balance} + ${pitch.target_investment_amount}`,
      }).where(eq(business_accounts.id, pitch.business_account_id));
      await tx.insert(transactions).values(fundingTransaction);
      await tx.update(transactions).set({
        tnx_status: "completed",
      }).where(and(
        eq(transactions.related_pitch_id, pitch.instance_id),
        eq(transactions.txn_type, "investment"),
        eq(transactions.account_type, "investor"),
        eq(transactions.tnx_status, "pending"),
      ));
    })
  }


  return {
    success: true,
    message: `Invested $${amount.toLocaleString()} in ${pitch.product_title}`,
    tier,
    shares,
  };
}
