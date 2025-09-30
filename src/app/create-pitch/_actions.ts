"use server"

import { db } from '@/db';
import { BusinessPitchs, BusinessAccount } from '@/db/schema';
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import { stat } from 'fs';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { Goal } from 'lucide-react';

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

/**
 * Create pitch creates a new pitch in the database with all of the relevant data
 * @param busAccountID business account associated with the pitch
 * @param title Pitch title 
 * @param elevatorPitch Brief description of the pitch
 * @param detailedPitch Detialed description of the pitch
 * @param supportingMedia Link to S3 bucket folder where supporting media is stored
 * @param targetAmount The funding goal amount
 * @param startDate Start date of the pitch
 * @param endDate End date of the pitch
 * @param pricePerShare Pric per share of the pitch
 * @param bronzeMultiplier Multiplier for bronze shares
 * @param bronzeMax Max amount the user spends to be in the bronze tier
 * @param silverMultiplier multiplier for silver shares
 * @param silverMax Max amount the user spends to be in the silver tier
 * @param goldMultiplier multiplier for gold shares
 * @param goldMax max amount the user spends to be in the gold tier
 * @param dividendPeriod Period for dividend payouts
 */
export const createPitch = async (title: string, status: string, elevatorPitch: string, detailedPitch: string, targetAmount: string, startDate: Date, endDate: Date, bronzeMultiplier: string, bronzeMax: number, silverMultiplier: string, silverMax: number, goldMultiplier: string, dividendPayoutPeriod: string) => {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated) {
        return { success: false, message: 'User not authenticated' };
    }

    const dividendPayoutDate: Date = calculateDividendPayoutDate(dividendPayoutPeriod, endDate);

    await db.insert(BusinessPitchs).values({
        BusAccountID: userId,
        statusOfPitch: status,
        ProductTitle: title,
        ElevatorPitch: elevatorPitch,
        DetailedPitch: detailedPitch,
        SuportingMedia: "", // to be added later when media upload is implemented
        TargetInvAmount: targetAmount,
        InvestmentStart: startDate,
        InvestmentEnd: endDate,
        InvProfShare: 0, // to be added later if profit share is implemented
        pricePerShare: "0", // think this is calculated, not needed as an input?
        bronseTierMulti: bronzeMultiplier,
        bronseInvMax: bronzeMax,
        silverTierMulti: silverMultiplier,
        silverInvMax: silverMax,
        goldTierMulti: goldMultiplier,
        goldTierMax: parseInt(targetAmount),
        dividEndPayout: dividendPayoutDate, // this needs to be calculated based on the dividend period
        DividEndPayoutPeriod: dividendPayoutPeriod,
    });
}

/**
 * Calcualte the dividend payout date based on the funding end date and the dividend period
 * @param period 
 * @param start 
 * @returns 
 */
function calculateDividendPayoutDate(period: string, end: Date) {
    const payoutDate = new Date(end)
    if (period == "quarterly") {
        payoutDate.setFullYear(payoutDate.getFullYear(), payoutDate.getMonth()+4)
    } else if (period == "yearly") {
        payoutDate.setFullYear(payoutDate.getFullYear()+1)
    }
    return payoutDate
}