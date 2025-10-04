"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db"; // adjust to your drizzle client path
import { InvestorAccounts, InvestmentLedger, DividendPayouts, BusinessPitchs } from "@/db/schema";
import { eq, InferInsertModel, InferSelectModel, exists, sql } from "drizzle-orm";
import { Dividend, Investment, InvestorInfo } from "../../../types/investor_data";
import { Pitches } from "../../../types/pitch";
import { XMLParser } from "fast-xml-parser";
import { NativeScrollArea } from "@mantine/core";

// gets the pitches from the da and returns them in an array of Pitches objects
// data types of investmentStart to dividEndPayout are converted from Date to string to match Pitches type
//returns an array of Pitches objects

export async function getAllBusinessPitches(): Promise<Pitches[]> {
  const pitches = await db
    .select()
    .from(BusinessPitchs);
  // Convert Date objects to strings to match Pitches type
  return await Promise.all(
    pitches.map(async (pitch) => ({
      ...pitch,
      InvestmentStart: pitch.InvestmentStart.toISOString(),
      InvestmentEnd: pitch.InvestmentEnd.toISOString(),
      dividEndPayout: pitch.dividEndPayout.toISOString(),
      FeaturedImage: pitch.SuportingMedia ? await fetchFeaturedMedia(pitch.BusPitchID.toString()) : null,
    }))
  );
}

//gets total money invested in all the pitches on the db
// returns an array of objects with busPitchID and totalAmount invested

export async function getTotalMoneyInvested(): Promise<{busPitchID: number, totalAmount: number}[]> {
  const result = await db
    .select({
      busPitchID: InvestmentLedger.BusPitchID,
      totalAmount: sql<number>`SUM(${InvestmentLedger.AmountInvested})`.as('totalAmount')
    })
    .from(InvestmentLedger)
    .groupBy(InvestmentLedger.BusPitchID);

  return result;
}


export async function fetchFeaturedMedia(pitchID: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BUCKET_URL}?list-type=2&prefix=${pitchID}/`);
    const data = await res.text();

    const parser = new XMLParser();
    const json = parser.parse(data);

    let items = json.ListBucketResult?.Contents || [];
    if (!Array.isArray(items)) items = [items];
    const mediaItem = items.find((item: any) => item.Key.startsWith(`${pitchID}/featured`) && item.Size > 0);
    const mediaUrl = mediaItem ? `${process.env.NEXT_PUBLIC_BUCKET_URL}${mediaItem.Key}` : "";
    return mediaUrl;
}