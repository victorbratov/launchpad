"use server";

import { db } from "@/db";
import { business_pitches, investment_ledger } from "@/db/schema";
import { BusinessPitch } from "@/db/types";
import { desc, sql } from "drizzle-orm";
import { Advent_Pro } from "next/font/google";

export interface PitchWithStats extends BusinessPitch {
  total_invested: number;
  invested_percent: number;
}

export async function getPitches(): Promise<PitchWithStats[]> {
  const pitches = await db.select().from(business_pitches).orderBy(desc(business_pitches.adverts_available));

  const investments = await db
      .select({
        pitch_id: investment_ledger.pitch_id,
        total_invested: sql<number>`sum(${investment_ledger.amount_invested})`,
      })
      .from(investment_ledger)
      .groupBy(investment_ledger.pitch_id)

  const investmentMap = new Map(investments.map((i) => [i.pitch_id, Number(i.total_invested)]));

  const enriched: PitchWithStats[] = pitches.map((pitch) => {
    const total = investmentMap.get(pitch.instance_id) || 0;
    const invested_percent = (total / (pitch.target_investment_amount || 1)) * 100;
    return { ...pitch, total_invested: total, invested_percent };
  });

  return enriched;
}
