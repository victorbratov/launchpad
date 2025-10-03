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

    const businessAccount = await db.select({name: BusinessAccount.BusName, email: BusinessAccount.BusEmail, wallet: BusinessAccount.BusWallet} ).from(BusinessAccount).where(eq(BusinessAccount.BusAccountID, userId)).limit(1);
    return businessAccount[0];
};

/**
 * Withdraw from the account balance of the current user into their linked bank account
 * @param balance The amount to be withdrawn
 * @throws Error if the user is not authenticated
 */
export const withdrawBalance = async (balance: number) => {
    const { isAuthenticated, userId } = await auth();
    if (!isAuthenticated) {
        throw new Error('User not authenticated');
    }
    // update the business account wallet
    const [updatedAccount] = await db.update(BusinessAccount).set({
         BusWallet: sql`${BusinessAccount.BusWallet} - ${balance}`
    }).where(eq(BusinessAccount.BusAccountID, userId)).returning();;

    // update the bank account 
    await db.update(TheBank).set({
        Ballance: sql`${TheBank.Ballance} + ${balance}`
    }).where(eq(TheBank.BankAccountNumber, updatedAccount.BusBankAcc)); 
}