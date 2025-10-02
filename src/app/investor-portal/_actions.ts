"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db"; // adjust to your drizzle client path
import { InvestorAccounts, InvestmentLedger, DividendPayouts, BusinessPitchs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Dividend, Investment, InvestorInfo } from "../../../types/investor_data";

/**
 * Get the current authenticated user's Clerk ID.
 * @throws {Error} If no user is authenticated.
 * @returns The authenticated user's Clerk ID.
 */
async function getCurrentUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: no authenticated user found.");
  }
  return userId;
}

/**
 * Fetch investor profile info for the currently authenticated user.
 * @returns Investor details or null if no record exists.
 */
export async function getInvestorInfo(): Promise<InvestorInfo | null> {
  const userId = await getCurrentUserId();

  const result = await db
    .select()
    .from(InvestorAccounts)
    .where(eq(InvestorAccounts.InvestorID, userId));

  if (!result.length) return null;

  const inv = result[0];
  return {
    investorID: inv.InvestorID,
    name: inv.InvName,
    email: inv.InvEmail,
    bankAccNum: parseInt(inv.InvBankACNumber),
    walletAmount: Number(inv.InvWallet),
  };
}

/**
 * Fetch all investments made by the currently authenticated user.
 * @returns Array of investments with formatted fields.
 */
export async function getInvestments(): Promise<Array<Investment>> {
  const userId = await getCurrentUserId();

  const results = await db
    .select({
      investorID: InvestmentLedger.InvestorID,
      investmentID: InvestmentLedger.BusPitchID,
      pitchID: InvestmentLedger.BusPitchID,
      pitchName: BusinessPitchs.ProductTitle,
      investmentDate: BusinessPitchs.InvestmentStart,
      investmentCost: InvestmentLedger.AmountInvested,
      shareAmount: InvestmentLedger.shares,
      tier: InvestmentLedger.TierOfInvestment,
    })
    .from(InvestmentLedger)
    .innerJoin(BusinessPitchs, eq(InvestmentLedger.BusPitchID, BusinessPitchs.BusPitchID))
    .where(eq(InvestmentLedger.InvestorID, userId));

  return results.map((r) => ({
    ...r,
    investmentDate: r.investmentDate.toISOString().split("T")[0], // format YYYY-MM-DD
    investmentCost: Number(r.investmentCost),
  }));
}

/**
 * Fetch all dividends paid to the currently authenticated user.
 * @returns Array of dividends with formatted fields.
 */
export async function getDividends(): Promise<Array<Dividend>> {
  const userId = await getCurrentUserId();

  const results = await db
    .select({
      pitchID: DividendPayouts.BusPitchID,
      pitchName: BusinessPitchs.ProductTitle,
      investmentID: DividendPayouts.BusPitchID, // no direct invID, so mapped to pitch
      dividendAmount: DividendPayouts.DividenndAmount,
      dividendDate: DividendPayouts.DataPayedOut,
    })
    .from(DividendPayouts)
    .innerJoin(BusinessPitchs, eq(DividendPayouts.BusPitchID, BusinessPitchs.BusPitchID))
    .where(eq(DividendPayouts.InvestorID, userId));

  return results.map((r) => ({
    ...r,
    dividendDate: r.dividendDate.toISOString().split("T")[0],
    dividendAmount: Number(r.dividendAmount),
  }));
}
