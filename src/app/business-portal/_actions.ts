"use server";

import { db } from "@/db";
import { BusinessPitchs } from "@/db/schema";
import { eq } from "drizzle-orm";

/** Fetch pitch by ID */
export async function getPitch(pitchId: number) {
  console.log("[getPitch] Received pitchId:", pitchId);

  const [pitch] = await db
    .select()
    .from(BusinessPitchs)
    .where(eq(BusinessPitchs.BusPitchID, pitchId));

  if (!pitch) console.log("[getPitch] No pitch found for pitchId:", pitchId);

  return pitch || null;
}

/** Update editable pitch fields */
export async function updatePitch(
  pitchId: number,
  values: {
    ProductTitle?: string;
    ElevatorPitch?: string;
    DetailedPitch?: string;
  }
) {
  console.log("[updatePitch] Updating pitch:", pitchId, values);

  await db
    .update(BusinessPitchs)
    .set({
      ...(values.ProductTitle && { ProductTitle: values.ProductTitle }),
      ...(values.ElevatorPitch && { ElevatorPitch: values.ElevatorPitch }),
      ...(values.DetailedPitch && { DetailedPitch: values.DetailedPitch }),
    })
    .where(eq(BusinessPitchs.BusPitchID, pitchId));

  return { success: true };
}
