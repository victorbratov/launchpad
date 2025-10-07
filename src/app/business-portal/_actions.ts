"use server";

import { db } from "@/db";
import { bank_accounts, business_accounts, business_pitches, transactions, investment_ledger, investor_accounts } from "@/db/schema";
import { BusinessAccount, BusinessPitch } from "@/db/types";
import { calculateDividendPayoutDate } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { eq, sql, inArray } from "drizzle-orm";
import next from "next";
import { calculateInvestorProfits } from "@/lib/utils"


/**
 * Get the business account information for the currently authenticated user
 * @returns The business account information for the currently authenticated user
 * @throws Error if the user is not authenticated or the business account is not found
 * @returns {Promise<BusinessAccount>} Promise that resolves to the business account information
 */
export const getBusinessAccountInfo = async (): Promise<BusinessAccount> => {
  const { userId } = await auth()

  if (userId === null) {
    throw new Error("User not authenticated");
  }

  const account_info = await db.select().from(business_accounts).where(eq(business_accounts.id, userId)).limit(1)

  if (account_info.length === 0) {
    throw new Error("Business account not found");
  }

  return account_info[0];

}

/**
 * Deposit funds into the business account
 * @param amount The amount to deposit
 * @throws Error if the user is not authenticated, bank account not found, or insufficient funds
 * @returns {Promise<void>}
 */
export const depositFunds = async (amount: number): Promise<void> => {
  const { userId } = await auth()

  if (userId === null) {
    throw new Error("User not authenticated");
  }

  const userInfo = await getBusinessAccountInfo()

  const [userBankAccount] = await db.select().from(bank_accounts).where(eq(bank_accounts.id, userInfo.bank_account_id)).limit(1)

  if (userBankAccount === undefined) {
    throw new Error("Bank account not found");
  }

  if (userBankAccount.balance < amount) {
    throw new Error("Insufficient funds in bank account");
  }

  await db.transaction(async (tx) => {
    await tx.update(bank_accounts).set({
      balance: userBankAccount.balance - amount,
    }).where(eq(bank_accounts.id, userBankAccount.id));

    await tx.update(business_accounts).set({
      wallet_balance: userInfo.wallet_balance + amount,
    }).where(eq(business_accounts.id, userId));

    await tx.insert(transactions).values({ account_type: "business", account_id: userId, txn_type: "deposit", amount });
  })
}

/**
 * Withdraw funds from the business account to the linked bank account
 * @param amount The amount to withdraw
 * @throws Error if the user is not authenticated, bank account not found, or insufficient funds
 * @returns {Promise<void>}
 */
export const withdrawFunds = async (amount: number): Promise<void> => {
  const userInfo = await getBusinessAccountInfo()

  const [userBankAccount] = await db.select().from(bank_accounts).where(eq(bank_accounts.id, userInfo.bank_account_id)).limit(1)

  if (userBankAccount === undefined) {
    throw new Error("Bank account not found");
  }

  if (userInfo.wallet_balance < amount) {
    return Promise.reject("Insufficient funds in platform wallet");
  }

  await db.transaction(async (tx) => {
    await tx.update(bank_accounts).set({
      balance: userBankAccount.balance + amount,
    }).where(eq(bank_accounts.id, userBankAccount.id))

    await tx.update(business_accounts).set({
      wallet_balance: userInfo.wallet_balance - amount,
    }).where(eq(business_accounts.id, userInfo.id))

    await tx.insert(transactions).values({ account_type: "business", account_id: userInfo.id, txn_type: "withdrawal", amount });
  })
}

/**
 * Get the latest versions of pitches for the currently authenticated business user
 * @throws Error if the user is not authenticated
 * @returns {Promise<BusinessPitch[]>} Promise that resolves to a list of business pitches
 */
export const getPitches = async (): Promise<BusinessPitch[]> => {
  const { userId } = await auth();

  if (userId === null) {
    throw new Error("User not authenticated");
  }

  const latestVersions = db
    .select({
      pitch_id: business_pitches.pitch_id,
      max_version: sql<number>`MAX(${business_pitches.version})`.as("max_version"),
    })
    .from(business_pitches)
    .where(eq(business_pitches.business_account_id, userId))
    .groupBy(business_pitches.pitch_id)
    .as("latest_versions");

  const pitches = await db
    .select()
    .from(business_pitches)
    .innerJoin(
      latestVersions,
      sql`${business_pitches.pitch_id} = ${latestVersions.pitch_id} AND ${business_pitches.version} = ${latestVersions.max_version}`
    );

  return pitches.map(p => p.business_pitches);
};

/**
 * 
 * @param pitchId 
 * @param profitAmount 
 * @param updateMessage 
 */
export const declareProfits = async (pitchId: string, profitAmount: number, updateMessage: string): Promise<string | undefined> => {

  const userInfo = await getBusinessAccountInfo();
  const [pitch] = await db.select().from(business_pitches).where(eq(business_pitches.pitch_id, pitchId)).limit(1);

  if (pitch === undefined) {
    throw new Error("Pitch not found");
  }

  if (userInfo.wallet_balance < profitAmount) {
    return "Insufficient funds in platform wallet";
  }

  await db.transaction(async (tx) => {
    await tx.insert(transactions).values({ account_type: "business", account_id: userInfo.id, txn_type: "profit_declaration", amount: profitAmount, description: updateMessage });

    // update account balance
    await tx.update(business_accounts).set({ wallet_balance: sql`${business_accounts.wallet_balance} - ${profitAmount}` }).where(eq(business_accounts.id, userInfo.id));

    // get all pitch versions with this pitch id
    const pitchVersions = await tx.select().from(business_pitches).where(eq(business_pitches.pitch_id, pitchId));
    if (!pitchVersions || pitchVersions.length === 0) {
      throw new Error("No pitch versions found");
    }
    console.log("Pitch versions found:", pitchVersions.length);

    // get all investments from the investment ledger with any of these pitch instance ids
    const pitchInstanceIds = pitchVersions.map(p => p.instance_id);
    const pitchInvestments = await tx.select().from(investment_ledger).where(inArray(investment_ledger.pitch_id, pitchInstanceIds));
    console.log("Investments found for pitch:", pitchInvestments);
    if (pitchInvestments.length === 0) {
      // no investments, nothing more to do
      return;
    }

    const totalShares = pitchInvestments.reduce((acc, curr) => acc + curr.shares_allocated, 0);
    for (const investment of pitchInvestments) {
      const investorProfit = calculateInvestorProfits(investment.shares_allocated, totalShares, profitAmount, pitch.investor_profit_share_percent);

      // update the investor account balance and create a transaction
      await tx.update(investor_accounts).set({ wallet_balance: sql`${investor_accounts.wallet_balance} + ${investorProfit}` }).where(eq(investor_accounts.id, investment.investor_id));
      await tx.insert(transactions).values({ account_type: "investor", account_id: investment.investor_id, txn_type: "profit_distribution", amount: investorProfit, description: updateMessage });
    }

    // then need to update the pitch next payout date based on the dividend payout period and todays date
    const nextPayout = calculateDividendPayoutDate(pitch.dividend_payout_period, new Date());
    await tx.update(business_pitches).set({ next_payout_date: nextPayout }).where(eq(business_pitches.pitch_id, pitchId));;
  });
}

