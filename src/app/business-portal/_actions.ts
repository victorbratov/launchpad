"use server";

import { db } from "@/db";
import { BusinessAccount, TheBank, InvestmentLedger, BusinessPitchs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import type { Pitches } from "../../../types/pitch";

/** Business account info */
export const getBusinessAccountInfo = async () => {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated) throw new Error("User not authenticated");

  const businessAccount = await db
    .select({
      name: BusinessAccount.BusName,
      email: BusinessAccount.BusEmail,
      wallet: BusinessAccount.BusWallet,
    })
    .from(BusinessAccount)
    .where(eq(BusinessAccount.BusAccountID, userId))
    .limit(1);

  return businessAccount[0];
};

/** Withdraw funds from business account to linked bank account */
export const withdrawBalance = async (amount: number) => {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated) throw new Error("User not authenticated");

  const [updatedAccount] = await db
    .update(BusinessAccount)
    .set({ BusWallet: sql`${BusinessAccount.BusWallet} - ${amount}` })
    .where(eq(BusinessAccount.BusAccountID, userId))
    .returning();

  if (!updatedAccount) throw new Error("Business account not found");

  await db
    .update(TheBank)
    .set({ Ballance: sql`${TheBank.Ballance} + ${amount}` })
    .where(eq(TheBank.BankAccountNumber, updatedAccount.BusBankAcc));
};

/** Deposit funds from linked bank account to business account */
export const depositBalance = async (amount: number) => {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated) throw new Error("User not authenticated");

  const [businessAccount] = await db
    .select()
    .from(BusinessAccount)
    .where(eq(BusinessAccount.BusAccountID, userId))
    .limit(1);
  if (!businessAccount) throw new Error("Business account not found");

  const [bankAccount] = await db
    .select()
    .from(TheBank)
    .where(eq(TheBank.BankAccountNumber, businessAccount.BusBankAcc))
    .limit(1);

  if (parseFloat(bankAccount.Ballance) < amount) {
    throw new Error("Insufficient funds in bank account");
  }

  await db
    .update(BusinessAccount)
    .set({ BusWallet: sql`${BusinessAccount.BusWallet} + ${amount}` })
    .where(eq(BusinessAccount.BusAccountID, userId));

  await db
    .update(TheBank)
    .set({ Ballance: sql`${TheBank.Ballance} - ${amount}` })
    .where(eq(TheBank.BankAccountNumber, businessAccount.BusBankAcc));
};

/** Fetch all pitches for the current user */
export async function getUserPitches(): Promise<Pitches[]> {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) throw new Error("Not authenticated");

  const pitches = await db
    .select()
    .from(BusinessPitchs)
    .where(eq(BusinessPitchs.BusAccountID, userId));

  return pitches.map((p) => ({
    BusPitchID: p.BusPitchID,
    BusAccountID: p.BusAccountID,
    ProductTitle: p.ProductTitle,
    ElevatorPitch: p.ElevatorPitch,
    DetailedPitch: p.DetailedPitch,
    SuportingMedia: p.SuportingMedia,
    TargetInvAmount: p.TargetInvAmount,
    InvProfShare: p.InvProfShare,
    DividEndPayoutPeriod: p.DividEndPayoutPeriod,
    statusOfPitch: p.statusOfPitch ?? "pending",
    InvestmentStart: p.InvestmentStart?.toISOString() ?? new Date().toISOString(),
    InvestmentEnd: p.InvestmentEnd?.toISOString() ?? new Date().toISOString(),
    pricePerShare: p.pricePerShare ?? "0",
    bronseTierMulti: p.bronseTierMulti ?? "0",
    bronseInvMax: p.bronseInvMax ?? 0,
    silverTierMulti: p.silverTierMulti ?? "0",
    silverInvMax: p.silverInvMax ?? 0,
    goldTierMulti: p.goldTierMulti ?? "0",
    goldTierMax: p.goldTierMax ?? 0,
    dividEndPayout: p.dividEndPayout?.toISOString() ?? new Date().toISOString(),
    FeaturedImage: "",
    Tags: p.Tags ?? [],
  }));
}

/** Get total money invested in a pitch */
export async function getTotalMoneyInvestedInPitch(
  busPitchID: number
): Promise<{ busPitchID: number; totalAmount: number } | null> {
  const result = await db
    .select({
      busPitchID: InvestmentLedger.BusPitchID,
      totalAmount: sql<number>`SUM(${InvestmentLedger.AmountInvested})`.as("totalAmount"),
    })
    .from(InvestmentLedger)
    .where(eq(InvestmentLedger.BusPitchID, busPitchID))
    .groupBy(InvestmentLedger.BusPitchID)
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/** Get total investors in a pitch */
export async function getTotalInvestorsInPitch(
  busPitchID: number
): Promise<{ busPitchID: number; investorCount: number } | null> {
  const result = await db
    .select({
      busPitchID: InvestmentLedger.BusPitchID,
      investorCount: sql<number>`COUNT(DISTINCT ${InvestmentLedger.InvestorID})`.as("investorCount"),
    })
    .from(InvestmentLedger)
    .where(eq(InvestmentLedger.BusPitchID, busPitchID))
    .groupBy(InvestmentLedger.BusPitchID)
    .limit(1);

  return result.length > 0 ? result[0] : null;
}
