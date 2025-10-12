"use server";

import { db } from "@/db";
import { BusinessPitch } from "@/db/types";
import { sql } from "drizzle-orm";

export interface PitchWithStats extends BusinessPitch {
  total_invested: number;
  invested_percent: number;
}

/**
 * This function retrieves all active business pitches along with their latest versions,
 * @returns An array of active business pitches sorted by adverts available in descending order.
 * */
export async function getPitches(): Promise<BusinessPitch[]> {
  const result = await db.execute(sql`
    SELECT *
    FROM (
      SELECT *,
             ROW_NUMBER() OVER (PARTITION BY pitch_id ORDER BY version DESC) AS rn
      FROM business_pitches
    ) ranked
    WHERE rn = 1 AND status = 'active'
    ORDER BY adverts_available DESC;
  `);

  return result.rows as BusinessPitch[];
}
