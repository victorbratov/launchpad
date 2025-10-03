"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db"; // adjust to your drizzle client path
import { InvestorAccounts, InvestmentLedger, DividendPayouts, BusinessPitchs } from "@/db/schema";
import { eq, InferInsertModel, InferSelectModel, exists, sql } from "drizzle-orm";
import { Dividend, Investment, InvestorInfo } from "../../../../types/investor_data";
import { Pitches } from "../../../../types/pitch";


type BusinessPitchRow = InferInsertModel<typeof BusinessPitchs>;


//  Gets pitch by the ID inputted 
//  @param pitchID - The ID of the pitch to retrieve
//  @returns A Promise that resolves to a Pitches object or null if not found

export async function getPitchById(pitchID: number): Promise<Pitches | null> {
  const result = await db
    .select()
    .from(BusinessPitchs)
    .where(eq(BusinessPitchs.BusPitchID, pitchID))
    .limit(1);

  if (result.length === 0) return null;

  const pitch = result[0];
  
  // Convert dates to strings to match Pitches type
  return {
    ...pitch,
    InvestmentStart: pitch.InvestmentStart.toISOString(),
    InvestmentEnd: pitch.InvestmentEnd.toISOString(),
    dividEndPayout: pitch.dividEndPayout.toISOString()
  };
}


//gets total money invested in the pitches on the db
// returns a single object with busPitchID and totalAmount invested
//@param busPitchID - The ID of the pitch to retrieve total investment for


export async function getTotalMoneyInvestedInPitch(busPitchID: number): Promise<{busPitchID: number, totalAmount: number} | null> {
  const result = await db
    .select({
      busPitchID: InvestmentLedger.BusPitchID,
      totalAmount: sql<number>`SUM(${InvestmentLedger.AmountInvested})`.as('totalAmount')
    })
    .from(InvestmentLedger)
    .where(eq(InvestmentLedger.BusPitchID, busPitchID))
    .groupBy(InvestmentLedger.BusPitchID)
    .limit(1);

  return result.length > 0 ? result[0] : null;
}
