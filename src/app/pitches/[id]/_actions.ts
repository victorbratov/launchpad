"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  business_pitches,
  investor_accounts,
  investment_ledger,
  business_accounts,
} from "@/db/schema";
import { BusinessPitch } from "@/db/types";
import { eq, sql } from "drizzle-orm";

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
export async function investInPitch(entityId: string, amount: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");
  if (amount <= 0) throw new Error("Invalid investment amount");

  // Find the current active pitch version for this entity
  const [pitch] = await db
    .select()
    .from(business_pitches)
    .where(eq(business_pitches.instance_id, entityId))
    .orderBy(sql`${business_pitches.version} DESC`)
    .limit(1);

  if (!pitch) throw new Error("Pitch not found");

  const [investor] = await db
    .select()
    .from(investor_accounts)
    .where(eq(investor_accounts.id, userId));

  if (!investor) throw new Error("Investor account not found");

  // Get current invested total across entity versions
  const totalResult = await getTotalMoneyInvestedInPitch(entityId);
  const investedSoFar = totalResult?.totalAmount || 0;
  const remaining = pitch.target_investment_amount - investedSoFar;

  if (amount > remaining) throw new Error("Investment exceeds remaining target");
  if (investor.wallet_balance < amount) throw new Error("Insufficient wallet balance");

  // Determine tier based on thresholds
  let tier = "Bronze";
  let multiplier = pitch.bronze_multiplier;
  if (amount > pitch.silver_threshold && amount <= pitch.gold_threshold) {
    tier = "Silver";
    multiplier = pitch.silver_multiplier;
  } else if (amount > pitch.gold_threshold) {
    tier = "Gold";
    multiplier = pitch.gold_multiplier;
  }

  const shares = Math.floor(amount * multiplier);

  // -- Apply updates --

  await db
    .update(investor_accounts)
    .set({
      wallet_balance: sql`${investor_accounts.wallet_balance} - ${amount}`,
    })
    .where(eq(investor_accounts.id, userId));

  console.log(entityId);
  await db.insert(investment_ledger).values({
    investor_id: userId,
    pitch_id: entityId, // instance id of pitch
    tier,
    amount_invested: amount,
    shares_allocated: shares,
  });

  await db
    .update(business_accounts)
    .set({
      wallet_balance: sql`${business_accounts.wallet_balance} + ${amount}`,
    })
    .where(eq(business_accounts.id, pitch.business_account_id));

  return {
    success: true,
    message: `Invested $${amount.toLocaleString()} in ${pitch.product_title}`,
    tier,
    shares,
  };
}
