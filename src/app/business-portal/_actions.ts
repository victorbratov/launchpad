"use server"

import { db } from '@/db';
import { BusinessAccount, TheBank } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, sql } from 'drizzle-orm';

/**
 * Get the information about the business account of the current user
 * @returns Business account information including name, email and wallet balance
 * @throws Error if the user is not authenticated
 */
export const getBusinessAccountInfo = async () => {
    const { isAuthenticated, userId } = await auth();
    if (!isAuthenticated) {
        throw new Error('User not authenticated');
    }

    const businessAccount = await db.select({ name: BusinessAccount.BusName, email: BusinessAccount.BusEmail, wallet: BusinessAccount.BusWallet }).from(BusinessAccount).where(eq(BusinessAccount.BusAccountID, userId)).limit(1);
    return businessAccount[0];
};

/**
 * Withdraw from the account balance of the current user into their linked bank account
 * @param amount The amount to be withdrawn
 * @throws Error if the user is not authenticated
 */
export const withdrawBalance = async (amount: number) => {
    const { isAuthenticated, userId } = await auth();
    if (!isAuthenticated) {
        throw new Error('User not authenticated');
    }
    // update the business account wallet
    const [updatedAccount] = await db.update(BusinessAccount).set({
        BusWallet: sql`${BusinessAccount.BusWallet} - ${amount}`
    }).where(eq(BusinessAccount.BusAccountID, userId)).returning();;
    if (!updatedAccount) {
        throw new Error('Business account not found');
    }
    // update the bank account 
    await db.update(TheBank).set({
        Ballance: sql`${TheBank.Ballance} + ${amount}`
    }).where(eq(TheBank.BankAccountNumber, updatedAccount.BusBankAcc));
}

/**
 * Deposit into the account balance of the current user from their linked bank account
 * @param amount The amount to be deposited
 * @throws Error if the user is not authenticated
 */
export const depositBalance = async (amount: number) => {
    const { isAuthenticated, userId } = await auth();
    if (!isAuthenticated) {
        throw new Error('User not authenticated');
    }
    // get the account number of the business account
    const [businessAccount] = await db.select().from(BusinessAccount
    ).where(eq(BusinessAccount.BusAccountID, userId)).limit(1);
    if (!businessAccount) {
        throw new Error('Business account not found');
    }

    // check there is sufficient funds in the bank account
    const [bankAccount] = await db.select().from(TheBank
    ).where(eq(TheBank.BankAccountNumber, businessAccount.BusBankAcc)).limit(1);

    if (parseFloat(bankAccount.Ballance) < amount) {
        throw new Error('Insufficient funds in bank account');
    }

    // update the business account wallet
    await db.update(BusinessAccount).set({
        BusWallet: sql`${BusinessAccount.BusWallet} + ${amount}`
    }).where(eq(BusinessAccount.BusAccountID, userId));

    // update the bank account 
    await db.update(TheBank).set({
        Ballance: sql`${TheBank.Ballance} - ${amount}`
    }).where(eq(TheBank.BankAccountNumber, businessAccount.BusBankAcc));
}