"use server"
import { db } from '@/db';
import { BusinessPitchs, BusinessAccount } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

/**
 * Function to check the user is authenticated and has a business account
 * @returns true if the user has a business account, false otherwise
 */
export const checkBusinessAuthentication = async () => {
    const { isAuthenticated, userId } = await auth();
    if (!isAuthenticated) {
        return false;
    }
    const businessAccount = await db.select().from(BusinessAccount).where(eq(BusinessAccount.BusAccountID, userId));
    if (businessAccount.length === 1) {
        return true;
    }
    return false;
}
