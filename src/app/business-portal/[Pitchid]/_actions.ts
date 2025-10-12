"use server";

import { db } from "@/db";
import { business_pitches } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";

/**
 * Fetch the latest version of a pitch by pitch_id
 * @param pitchId - pitch_id of the pitch to fetch
 * @returns The latest version of the pitch
 * @throws Error if the user is not authenticated, pitch not found, or unauthorized
 */
export async function getPitch(pitchId: string) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) throw new Error("Not authenticated");

  const [pitch] = await db
    .select()
    .from(business_pitches)
    .where(eq(business_pitches.pitch_id, pitchId))
    .orderBy(desc(business_pitches.version))
    .limit(1);

  if (!pitch) throw new Error("Pitch not found");
  if (pitch.business_account_id !== userId) throw new Error("Unauthorized");

  return pitch;
}

/**
 * Create new version (metadata only) and return instance_id
 * @param pitchId - pitch_id of the pitch to create a new version for
 * @param values - new values for the pitch
 * @returns instance_id of the new version
 * @throws Error if the user is not authenticated, pitch not found, or unauthorized
 */
export async function createPitchVersion(
  pitchId: string,
  values: {
    product_title: string;
    elevator_pitch: string;
    detailed_pitch: string;
    adverts_available: number;
  }
) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) throw new Error("Not authenticated");

  const [latest] = await db
    .select()
    .from(business_pitches)
    .where(eq(business_pitches.pitch_id, pitchId))
    .orderBy(desc(business_pitches.version))
    .limit(1);

  if (!latest) throw new Error("Pitch not found");
  if (latest.business_account_id !== userId) throw new Error("Unauthorized");

  const [newVersion] = await db
    .insert(business_pitches)
    .values({
      ...latest,
      instance_id: undefined, // auto-generated
      version: latest.version + 1,
      product_title: values.product_title,
      elevator_pitch: values.elevator_pitch,
      detailed_pitch: values.detailed_pitch,
      adverts_available: values.adverts_available,
      supporting_media: `${process.env.NEXT_PUBLIC_BUCKET_URL}/${pitchId}`, // will fill later
      created_at: new Date(),
    })
    .returning({ instance_id: business_pitches.instance_id });

  return newVersion.instance_id;
}

