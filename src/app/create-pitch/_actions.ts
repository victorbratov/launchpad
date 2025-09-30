"use server"

import { db } from '@/db';
import { BusinessPitchs, BusinessAccount } from '@/db/schema';
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import { stat } from 'fs';
import { redirect } from 'next/navigation';
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
export const createPitch = async (title: string, elevatorPitch: string, detailedPitch: string, targetAmount: string, startDate: Date, endDate: Date, bronzeMultiplier: string, bronzeMax: number, silverMultiplier: string, silverMax: number, goldMultiplier: string, goldMax: number, dividendPayoutPeriod: string) => {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated) {
        return { success: false, message: 'User not authenticated' };
    }

    const clerkUser = await currentUser();
    let status:string = 'Pending'

    console.log("start: ", startDate)
    console.log("end: ", endDate)
    console.log("now: ", new Date())
    // Validate pitch dates
    // if (!validateDates(startDate, endDate)) {
    //     return {success: false, message: 'Invalid start or end date'}
    // }
    
    // if pitch is starting today, set it to open
    // if (startDate.getDate() == new Date().getDate()) {
    //     status = 'Open';
    // }

    console.log("Creating pitch for user: ", userId);
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
        goldTierMax: goldMax,
        dividEndPayout: new Date(), // this needs to be calculated based on the dividend period
        DividEndPayoutPeriod: dividendPayoutPeriod,
    });
}

/**
 * Turns a date and time into date only
 * @param date the date to convert to date only
 * @returns The new date object, without time
 */
function dateOnly(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDay())
}

/**
 * Validates the start and end dates, checking end is not before start, and start date is not in the past
 * @param start start date
 * @param end end date
 * @returns True or false, if the dates are valid or not
 */
function validateDates(start: Date, end: Date) {
    if (start.getTime() >= end.getTime()) {
        console.log("End date must be after start date");
        return { success: false, message: 'End date must be after start date' };
    }
    if (start.getTime() < dateOnly(new Date()).getTime()) {
        console.log("Start date must be today or in the future");
        return { success: false, message: 'Start date must be today or in the future' };
    }
    console.log("dates ok")
}