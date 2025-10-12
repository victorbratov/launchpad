"use server"

import { db } from "@/db";
import { business_pitches, business_accounts } from "@/db/schema";
import { fetchFeaturedMedia } from "@/lib/s3_utils";
import { gt, desc, or, max, and, sql, eq } from "drizzle-orm";

const PitchAd = {
  id: business_pitches.pitch_id,
  instance_id: business_pitches.instance_id,
  title: business_pitches.product_title,
  elevator_pitch: business_pitches.elevator_pitch,
  adverts_available: business_pitches.adverts_available,
  media: business_pitches.supporting_media,
  version: business_pitches.version,
  status: business_pitches.status,
}

/**
 * Fetch all pitches that have funding available for advertisement.
 * Only returns active pitches that are currently seeking funding.
 * @returns {Promise<Array>} List of active pitches with adverts available
 */
export async function getAdvertisementPitches(): Promise<Array<any>> {
  // group by pitch_id to get the latest version of each pitch
  const latestPitches = await getAllLatestPitches();

  const conditions = latestPitches.map(lp =>
    and(
      eq(business_pitches.pitch_id, lp.pitch_id),
      eq(business_pitches.version, lp.version)
    )
  );

  // get the full details of these latest pitches - only active ones
  const pitches = await db.select(PitchAd).from(business_pitches)
    .where(
      and(
        gt(business_pitches.adverts_available, 0),
        eq(business_pitches.status, 'active'), // Only show active pitches
        or(...conditions)
      )
    )
    .orderBy(desc(business_pitches.adverts_available));

  // get the url of the featured media for each pitch
  for (const pitch of pitches) {
    try {
      // Always try to fetch media, regardless of supporting_media value
      const mediaUrl = await fetchFeaturedMedia(pitch.id);
      pitch.media = mediaUrl || null; // Set to null if fetchFeaturedMedia returns falsy value
      console.log(`Pitch ${pitch.id}: Media URL = ${pitch.media}, Status: ${pitch.status}`);
    } catch (error) {
      console.error(`Error fetching media for pitch ${pitch.id}:`, error);
      pitch.media = null;
    }
  }
  return pitches;
}

/**
 * Update the adverts_available and total_advert_clicks for a pitch when an advert is clicked.
 * Adverts available is decremented by 1 and total advert clicks is incremented by 1    
 * @param pitchInstanceId The pitch instance ID to update
 */
export async function updateAdvertCount(pitchInstanceId: string) {
  await db
    .update(business_pitches)
    .set({
      adverts_available: sql`${business_pitches.adverts_available} - 1`,
      total_advert_clicks: sql`${business_pitches.total_advert_clicks} + 1`
    })
    .where(eq(business_pitches.instance_id, pitchInstanceId));
}

/**
 * Get the latest version of a specific pitch by pitch ID.
 * @param pitchId Pitch ID to fetch the latest version for
 * @returns The latest pitch version or undefined if not found
 */
export async function getLatestPitchVersion(pitchId: string) {
  const [latestPitch] = await db
    .select()
    .from(business_pitches)
    .where(eq(business_pitches.pitch_id, pitchId))
    .orderBy(desc(business_pitches.version))
    .limit(1);
  return latestPitch;
}

/**
 * Get the latest version of all pitches.
 * @returns All latest pitch versions
 */
async function getAllLatestPitches() {
  const latestVersions = await db
    .select({
      pitch_id: business_pitches.pitch_id,
      max_version: max(business_pitches.version).as("max_version"),
    })
    .from(business_pitches)
    .groupBy(business_pitches.pitch_id)
    .as("latest_versions");

  const pitches = await db
    .select()
    .from(business_pitches)
    .innerJoin(
      latestVersions,
      and(
        eq(business_pitches.pitch_id, latestVersions.pitch_id),
        eq(business_pitches.version, latestVersions.max_version),
      )
    );
  return pitches.map(p => p.business_pitches);
}
