// _actions.ts
"use server";

import { db } from "@/db";
import { InvestmentLedger, BusinessPitchs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import type { Pitches } from "../../../types/pitch";



/**
 * Fetches pitches that match the users id.
 * 
 * @returns Returns all values in table including pitch id 
 * 
 */
export async function getUserPitches(): Promise<Pitches[]> {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) throw new Error("Not authenticated");

  const pitches = await db
    .select()
    .from(BusinessPitchs)
    .where(eq(BusinessPitchs.BusAccountID, userId));

  return pitches.map((p) => ({
    BusPitchID: p.BusPitchID,
  BusAccountID: p.BusAccountID,
  ProductTitle: p.ProductTitle,
  ElevatorPitch: p.ElevatorPitch,
  DetailedPitch: p.DetailedPitch,
  SuportingMedia: p.SuportingMedia,
  TargetInvAmount: p.TargetInvAmount,
  InvProfShare: p.InvProfShare,
  DividEndPayoutPeriod: p.DividEndPayoutPeriod,

  // fill required fields with real or default data
  statusOfPitch: p.statusOfPitch ?? "pending",
  InvestmentStart: p.InvestmentStart?.toISOString() ?? new Date().toISOString(),
  InvestmentEnd: p.InvestmentEnd?.toISOString() ?? new Date().toISOString(),
  pricePerShare: p.pricePerShare ?? "0",
  bronseTierMulti: p.bronseTierMulti ?? "0",
  bronseInvMax: p.bronseInvMax ?? 0,
  silverTierMulti: p.silverTierMulti ?? "0",
  silverInvMax: p.silverInvMax ?? 0,
  goldTierMulti: p.goldTierMulti ?? "0",
  goldTierMax: p.goldTierMax ?? 0,
  dividEndPayout: p.dividEndPayout?.toISOString() ?? new Date().toISOString(),
  }));
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


//gets total investors in the pitches on the db
// returns a single object with busPitchID and totalAmount of investors
//@param busPitchID - The ID of the pitch to retrieve total investment for
export async function getTotalInvestorsInPitch(busPitchID: number): Promise<{ busPitchID: number; investorCount: number } | null> {
  const result = await db
    .select({
      busPitchID: InvestmentLedger.BusPitchID,
      investorCount: sql<number>`COUNT(DISTINCT ${InvestmentLedger.InvestorID})`.as("investorCount"),
    })
    .from(InvestmentLedger)
    .where(eq(InvestmentLedger.BusPitchID, busPitchID))
    .groupBy(InvestmentLedger.BusPitchID)
    .limit(1);

  return result.length > 0 ? result[0] : null;
}
