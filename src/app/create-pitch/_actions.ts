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
 * Create a pitch in the database
 * @param title Pitch title
 * @param status Pitch status (pending, open)
 * @param elevatorPitch Elevator pitch
 * @param detailedPitch Detailed pitch overview
 * @param targetAmount Target funding amount
 * @param startDate Pitch start date
 * @param endDate Pitch end date
 * @param bronzeMultiplier Bronze multiplier
 * @param bronzeMax Bronze tier maximum
 * @param silverMultiplier silver multiplier
 * @param silverMax Silver tier maximum
 * @param goldMultiplier Gold multiplier
 * @param dividendPayoutPeriod How often dividends will be paid out (monthly, yearly, etc.)
 * @returns {{success: boolean, message: string}} An object with success indicating the success of the pitch creation, and message holding either the successfully created pitch ID or an error message
 */
export const createPitch = async (title: string, status: string, elevatorPitch: string, detailedPitch: string, targetAmount: string, startDate: Date, endDate: Date, bronzeMultiplier: string, bronzeMax: number, silverMultiplier: string, silverMax: number, goldMultiplier: string, dividendPayoutPeriod: string) => {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated) {
        return { success: false, message: 'User not authenticated' };
    }

    const dividendPayoutDate: Date = calculateDividendPayoutDate(dividendPayoutPeriod, endDate);

    const [insertedPitch] = await db.insert(BusinessPitchs).values({
        BusAccountID: userId,
        statusOfPitch: status,
        ProductTitle: title,
        ElevatorPitch: elevatorPitch,
        DetailedPitch: detailedPitch,
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
    }).returning();


    // update the database with the media url based on pitch ID
    const mediaURL = `${process.env.BUCKET_URL}${insertedPitch.BusPitchID}`
    await db.update(BusinessPitchs).set({SuportingMedia: mediaURL}).where(eq(BusinessPitchs.BusPitchID, insertedPitch.BusPitchID))
    return {success: true, message: mediaURL}
}

/**
 * Calcualte the dividend payout date based on the funding end date and the dividend period
 * @param period Lenght of the period
 * @param end End date of the pitch
 * @returns The payout date
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