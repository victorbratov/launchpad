"use server"

import { db } from "@/db";
import { business_pitches, business_accounts } from "@/db/schema";
import { fetchFeaturedMedia } from "@/lib/s3_utils";
import { gt, asc } from "drizzle-orm";
import { int } from "drizzle-orm/mysql-core";

const PitchAd = {
    id: business_pitches.pitch_id,
    title: business_pitches.product_title,
    elevator_pitch: business_pitches.elevator_pitch,
    adverts_available: business_pitches.adverts_available,
    media: business_pitches.supporting_media,
}

/**
 * Fetch all pitches that have funding available for advertisement.
 * @returns {Promise<Array>} List of pitches with adverts available
 */
export async function getAdvertisementPitches() {
    const pitches = await db.select(PitchAd).from(business_pitches)
        .where(gt(business_pitches.adverts_available, 0))
        .orderBy(asc(business_pitches.adverts_available));
    // get the url of the featured media for each pitch
    for (const pitch of pitches) {
        if (pitch.media) {
            pitch.media = await fetchFeaturedMedia(pitch.id);
        }
    }
    return pitches;
}