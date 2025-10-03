"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db"; // adjust to your drizzle client path
import { InvestorAccounts, InvestmentLedger, DividendPayouts, BusinessPitchs } from "@/db/schema";
import { eq, InferInsertModel, InferSelectModel, exists, sql } from "drizzle-orm";
import { Dividend, Investment, InvestorInfo } from "../../../types/investor_data";
import { Pitches } from "../../../types/pitch";





// gets the pitches from the da and returns them in an array of Pitches objects
// data types of investmentStart to dividEndPayout are converted from Date to string to match Pitches type
//returns an array of Pitches objects

export async function getAllBusinessPitches(): Promise<Pitches[]> {
  const pitches = await db
    .select()
    .from(BusinessPitchs);

  // Convert Date objects to strings to match Pitches type
  return pitches.map(pitch => ({
    ...pitch,
    InvestmentStart: pitch.InvestmentStart.toISOString(),
    InvestmentEnd: pitch.InvestmentEnd.toISOString(),
    dividEndPayout: pitch.dividEndPayout.toISOString()
  }));
}


//gets total money invested in all the pitches on the db
// returns an array of objects with busPitchID and totalAmount invested

export async function getTotalMoneyInvested(): Promise<{busPitchID: number, totalAmount: number}[]> {
  const result = await db
    .select({
      busPitchID: InvestmentLedger.BusPitchID,
      totalAmount: sql<number>`SUM(${InvestmentLedger.AmountInvested})`.as('totalAmount')
    })
    .from(InvestmentLedger)
    .groupBy(InvestmentLedger.BusPitchID);

  return result;
}