"use server";

import { db } from "@/db";
import { business_pitches, business_accounts } from "@/db/schema";
import { NewBusinessPitch } from "@/db/types";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { calculateDividendPayoutDate } from "@/lib/utils";

export interface Pitch {
  title: string;
  status: string;
  elevatorPitch: string;
  detailedPitch: string;
  targetAmount: string;
  startDate: Date;
  endDate: Date;
  bronzeMultiplier: string;
  bronzeMax: number;
  silverMultiplier: string;
  silverMax: number;
  goldMultiplier: string;
  dividendPayoutPeriod: string;
  tags: string[];
  profitShare: number;
}

/**
 * Checks if the current user is authenticated as a business account.
 * @returns {Promise<boolean>} promise that resolves to true if the user is a business account, false otherwise.
 */
export async function checkBusinessAuthentication(): Promise<boolean> {
  const { userId } = await auth();

  if (!userId) return false;

  const businessAccount = await db
    .select()
    .from(business_accounts)
    .where(eq(business_accounts.id, userId));

  return businessAccount.length === 1;
}

/**
 * Creates a new business pitch in the database.
 * @param pitch - Pitch details from the form
 * @returns {Promise<{ success: boolean; message: string }>} Result of the operation
 */
export async function createPitch(pitch: Pitch): Promise<{
  success: boolean;
  message: string;
}> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, message: "User not authenticated" };
  }

  // derive next payout date
  const nextPayout = calculateDividendPayoutDate(
    pitch.dividendPayoutPeriod,
    pitch.endDate
  );

  /** Map frontend fields → DB column names */
  const newPitch: NewBusinessPitch = {
    business_account_id: userId,
    status: pitch.status,
    product_title: pitch.title,
    elevator_pitch: pitch.elevatorPitch,
    detailed_pitch: pitch.detailedPitch,
    target_investment_amount: Number(pitch.targetAmount),
    raised_amount: 0,
    investor_profit_share_percent: pitch.profitShare,
    start_date: pitch.startDate,
    end_date: pitch.endDate,
    bronze_multiplier: Number(pitch.bronzeMultiplier),
    silver_multiplier: Number(pitch.silverMultiplier),
    gold_multiplier: Number(pitch.goldMultiplier),
    silver_threshold: pitch.bronzeMax,
    gold_threshold: pitch.silverMax,
    dividend_payout_period: pitch.dividendPayoutPeriod,
    next_payout_date: nextPayout,
    tags: pitch.tags,
  };

  const [inserted] = await db.insert(business_pitches).values(newPitch).returning({
    pitch_id: business_pitches.pitch_id,
  });

  // Build S3 media path
  const mediaUrl = `${process.env.NEXT_PUBLIC_BUCKET_URL}/${inserted.pitch_id}`;
  await db
    .update(business_pitches)
    .set({ supporting_media: mediaUrl })
    .where(eq(business_pitches.pitch_id, inserted.pitch_id));

  return { success: true, message: mediaUrl };
}