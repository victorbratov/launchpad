"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db"; // adjust to your drizzle client path
import { InvestorAccounts, InvestmentLedger, DividendPayouts, BusinessPitchs, BusinessAccount } from "@/db/schema";
import { eq, InferInsertModel, InferSelectModel, exists, sql } from "drizzle-orm";
import { Dividend, Investment, InvestorInfo } from "../../../../types/investor_data";
import { Pitches } from "../../../../types/pitch";


type BusinessPitchRow = InferInsertModel<typeof BusinessPitchs>;


//  Gets pitch by the ID inputted 
//  @param pitchID - The ID of the pitch to retrieve
//  @returns A Promise that resolves to a Pitches object or null if not found

export async function getPitchById(pitchID: number): Promise<Pitches | null> {
  const result = await db
    .select()
    .from(BusinessPitchs)
    .where(eq(BusinessPitchs.BusPitchID, pitchID))
    .limit(1);

  if (result.length === 0) return null;

  const pitch = result[0];

  // Convert dates to strings to match Pitches type
  return {
    ...pitch,
    InvestmentStart: pitch.InvestmentStart.toISOString(),
    InvestmentEnd: pitch.InvestmentEnd.toISOString(),
    dividEndPayout: pitch.dividEndPayout.toISOString(),
    FeaturedImage: null, // not needed here
  };
}


//gets total money invested in the pitches on the db
// returns a single object with busPitchID and totalAmount invested
//@param busPitchID - The ID of the pitch to retrieve total investment for


export async function getTotalMoneyInvestedInPitch(busPitchID: number): Promise<{ busPitchID: number, totalAmount: number } | null> {
  const result = await db
    .select({
      busPitchID: InvestmentLedger.BusPitchID,
      totalAmount: sql<number>`SUM(${InvestmentLedger.AmountInvested})`.as('totalAmount')
    })
    .from(InvestmentLedger)
    .where(eq(InvestmentLedger.BusPitchID, busPitchID))
    .groupBy(InvestmentLedger.BusPitchID)
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Handles the investment (share purchase) process for a specific business pitch.
 *
 * This server action performs validation, deducts the investment amount from the investor’s wallet,
 * records the investment in the ledger, and credits the business account wallet (optional).
 *
 * ### Validations:
 * - Ensures the user is authenticated.
 * - Confirms that the pitch exists.
 * - Verifies that the investor account exists.
 * - Checks that the investor has sufficient funds.
 * - Prevents investments that exceed the remaining target amount for the pitch.
 * - Determines the appropriate investment tier and calculates corresponding shares.
 *
 * ### Database Effects:
 * 1. Updates the `InvestorAccounts` table to deduct the invested amount from the user’s wallet.
 * 2. Inserts a new entry into the `InvestmentLedger` to record the transaction.
 * 3. (Optional) Updates the `BusinessAccount` table to increment the business wallet.
 *
 * @param busPitchID - The unique ID of the business pitch being invested in.
 * @param amount - The amount, in USD, the investor wishes to invest.
 * @returns A success message and investment summary if the operation completes successfully.
 * @throws If the user is unauthenticated, pitch or investor not found, insufficient funds, or investment exceeds the target.
 */
export async function investInPitch(busPitchID: number, amount: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const [pitch] = await db
    .select()
    .from(BusinessPitchs)
    .where(eq(BusinessPitchs.BusPitchID, busPitchID))
    .limit(1);

  if (!pitch) throw new Error("Pitch not found");

  const [investor] = await db
    .select()
    .from(InvestorAccounts)
    .where(eq(InvestorAccounts.InvestorID, userId))
    .limit(1);

  if (!investor) throw new Error("Investor not found");

  const totalInvested = await getTotalMoneyInvestedInPitch(busPitchID);
  const investedSoFar = parseFloat(totalInvested?.totalAmount?.toString() || "0");
  const target = parseFloat(pitch.TargetInvAmount);
  const remaining = target - investedSoFar;

  if (amount <= 0) throw new Error("Invalid investment amount");
  if (amount > remaining) throw new Error("Investment exceeds remaining target");
  const wallet = parseFloat(investor.InvWallet);
  if (wallet < amount) throw new Error("Insufficient funds");

  let tier = "Bronze";
  let multiplier = parseFloat(pitch.bronseTierMulti);
  if (amount > pitch.bronseInvMax && amount <= pitch.silverInvMax) {
    tier = "Silver";
    multiplier = parseFloat(pitch.silverTierMulti);
  } else if (amount > pitch.silverInvMax && amount <= pitch.goldTierMax) {
    tier = "Gold";
    multiplier = parseFloat(pitch.goldTierMulti);
  }
  const shares = Math.floor(amount * multiplier);

  await db
    .update(InvestorAccounts)
    .set({
      InvWallet: sql`${InvestorAccounts.InvWallet} - ${amount}`,
    })
    .where(eq(InvestorAccounts.InvestorID, userId));

  await db.insert(InvestmentLedger).values({
    InvestorID: userId,
    BusPitchID: busPitchID,
    TierOfInvestment: tier,
    AmountInvested: amount.toString(),
    shares,
  });

  // STEP 3 (optional): Credit the business account wallet
  await db
    .update(BusinessAccount)
    .set({
      BusWallet: sql`${BusinessAccount.BusWallet} + ${amount}`,
    })
    .where(eq(BusinessAccount.BusAccountID, pitch.BusAccountID));

  return {
    success: true,
    message: `Invested $${amount.toLocaleString()} in ${pitch.ProductTitle}`,
  };
}
