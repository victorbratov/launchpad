"use server"

import { db } from '@/db';
import { BusinessAccount } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

/**
 * Get the information about the business account of the current user
 * @returns 
 */
export const getBusinessAccountInfo = async () => {
    const { isAuthenticated, userId } = await auth();
    if (!isAuthenticated) {
        throw new Error('User not authenticated');
    }

    const businessAccount = await db.select({name: BusinessAccount.BusName, email: BusinessAccount.BusEmail, wallet: BusinessAccount.BusWallet} ).from(BusinessAccount).where(eq(BusinessAccount.BusAccountID, userId)).limit(1);
    return businessAccount[0];
};