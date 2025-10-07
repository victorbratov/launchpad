"use server"

import { db } from "@/db";
import { business_pitches, business_accounts } from "@/db/schema";
import { fetchFeaturedMedia } from "@/lib/s3_utils";
import { gt, desc, inArray, max, and, sql, eq } from "drizzle-orm";

const PitchAd = {
    id: business_pitches.pitch_id,
    instance_id: business_pitches.instance_id,
    title: business_pitches.product_title,
    elevator_pitch: business_pitches.elevator_pitch,
    adverts_available: business_pitches.adverts_available,
    media: business_pitches.supporting_media,
    version: business_pitches.version,
}

/**
 * Fetch all pitches that have funding available for advertisement.
 * @returns {Promise<Array>} List of pitches with adverts available
 */
export async function getAdvertisementPitches() {
    // group by pitch_id to get the latest version of each pitch
    const latestPitches = await db
        .select({
            pitch_id: business_pitches.pitch_id,
            maxVersion: max(business_pitches.version),
        })
        .from(business_pitches)
        .groupBy(business_pitches.pitch_id);

    // get the full details of these latest pitches
    const pitches = await db.select(PitchAd).from(business_pitches)
        .where(
            and(
                gt(business_pitches.adverts_available, 0),
                inArray(business_pitches.pitch_id, latestPitches.map(p => p.pitch_id))
            )
        )
        .orderBy(desc(business_pitches.adverts_available));

    // get the url of the featured media for each pitch
    for (const pitch of pitches) {
        if (pitch.media) {
            pitch.media = await fetchFeaturedMedia(pitch.id);
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
    console.log("Updating advert count for pitch instance ID:", pitchInstanceId);
    await db
        .update(business_pitches)
        .set({ 
            adverts_available: sql`${business_pitches.adverts_available} - 1`,
            total_advert_clicks: sql`${business_pitches.total_advert_clicks} + 1`
         })
        .where(eq(business_pitches.instance_id, pitchInstanceId));
}