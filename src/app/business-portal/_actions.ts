"use server";

import { db } from "@/db";
import { bank_accounts, business_accounts, business_pitches, transactions } from "@/db/schema";
import { BusinessAccount, BusinessPitch } from "@/db/types";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";


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

export const withdrawFunds = async (amount: number): Promise<void> => {
  const { userId } = await auth()

  if (userId === null) {
    throw new Error("User not authenticated");
  }

  const userInfo = await getBusinessAccountInfo()

  const [userBankAccount] = await db.select().from(bank_accounts).where(eq(bank_accounts.id, userInfo.bank_account_id)).limit(1)

  if (userBankAccount === undefined) {
    throw new Error("Bank account not found");
  }

  if (userInfo.wallet_balance < amount) {
    throw new Error("Insufficient funds in wallet");
  }

  await db.transaction(async (tx) => {
    await tx.update(bank_accounts).set({
      balance: userBankAccount.balance + amount,
    }).where(eq(bank_accounts.id, userBankAccount.id))

    await tx.update(business_accounts).set({
      wallet_balance: userInfo.wallet_balance - amount,
    }).where(eq(business_accounts.id, userId))

    await tx.insert(transactions).values({ account_type: "business", account_id: userId, txn_type: "withdrawal", amount });
  })
}

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
