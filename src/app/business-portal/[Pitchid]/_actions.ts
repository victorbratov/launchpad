"use server";

import { db } from "@/db";
import { BusinessPitchs} from "@/db/schema";
import { auth } from '@clerk/nextjs/server';
import { eq } from "drizzle-orm";

/**
 * @param pitchId - Unique ID to search through BusinessPitches for. It then checks if the user is the creator of the pitch.
 * @returns pitch object if the search is successful
 */
export async function getPitch(pitchId: number) {
  const { isAuthenticated, userId } = await auth();
  console.log("[getPitch] Received pitchId:", pitchId);
   if (!isAuthenticated || !userId) {
    throw new Error("Not authenticated");
  }

  const [pitch] = await db
    .select()
    .from(BusinessPitchs)
    .where(eq(BusinessPitchs.BusPitchID, pitchId));

  if (!pitch) {console.log("[getPitch] No pitch found for pitchId:", pitchId);
  }
  
  if (pitch.BusAccountID !== userId) {
    throw new Error("You do not own this pitch");
  }

   return {
    ...pitch,
    InvestmentStart: pitch.InvestmentStart?.toISOString() ?? null,
    InvestmentEnd: pitch.InvestmentEnd?.toISOString() ?? null,
    dividEndPayout: pitch.dividEndPayout?.toISOString() ?? null,
  };
}


/** 
 * @param PitchId The unique ID of the pitch to update.
 * @param values An object containing the below fields to update.
 * @param ProductTitle The new title.
 * @param ElevatorPitch The new elevator pitch.
 * @param DetailedPitch The new detailed pitch.
 * @param SuportingMedia Link to S3 https for page
 * @returns {Promise<{ success: boolean; message?: string }>} The result of the update operation.
*/
export async function updatePitch(
  pitchId: number,
  values: {
    ProductTitle?: string;
    ElevatorPitch?: string;
    DetailedPitch?: string;
    SuportingMedia?: string;
  }
) {
  console.log("[updatePitch] Updating pitch:", pitchId, values);

    const setValues: Partial<{
    ProductTitle: string;
    ElevatorPitch: string;
    DetailedPitch: string;
    SuportingMedia: string;
  }> = {};

  if (values.ProductTitle !== undefined) setValues.ProductTitle = values.ProductTitle;
  if (values.ElevatorPitch !== undefined) setValues.ElevatorPitch = values.ElevatorPitch;
  if (values.DetailedPitch !== undefined) setValues.DetailedPitch = values.DetailedPitch;
  if (values.SuportingMedia !== undefined) setValues.SuportingMedia = values.SuportingMedia;

  // Prevent error if setValues is empty
  if (Object.keys(setValues).length === 0) {
    console.warn("[updatePitch] No values to update");
    return { success: false, message: "No values to update" };
  }

  await db
    .update(BusinessPitchs)
    .set(setValues)
    .where(eq(BusinessPitchs.BusPitchID, pitchId));

  return { success: true };
}