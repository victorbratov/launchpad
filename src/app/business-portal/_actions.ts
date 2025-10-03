// _actions.ts
"use server";

import { db } from "@/db";
import { BusinessPitchs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
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
