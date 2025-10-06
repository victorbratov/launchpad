"use server"

import { db } from '@/db';
import { BusinessPitchs, BusinessAccount } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { GoogleGenAI } from "@google/genai";
import type {AIFeedback} from "../../../types/Feedback";

/**
 * Represents a business pitch
 */
export interface Pitch {
  title: string,
  status: string,
  elevatorPitch: string,
  detailedPitch: string,
  targetAmount: string,
  startDate: Date,
  endDate: Date,
  bronzeMultiplier: string,
  bronzeMax: number,
  silverMultiplier: string,
  silverMax: number,
  goldMultiplier: string,
  dividendPayoutPeriod: string,
  tags: string[]
}

/**
 * Function to check the user is authenticated and has a business account
 * @returns true if the user has a business account, false otherwise
 */
export const checkBusinessAuthentication = async () => {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated) {
    return false;
  }
  const businessAccount = await db.select().from(BusinessAccount).where(eq(BusinessAccount.BusAccountID, userId));
  if (businessAccount.length === 1) {
    return true;
  }
  return false;
}

/**
 * Create a pitch in the database
 * @param Pitch Pitch object containing all information necessary to create the pitch
 * @returns {{success: boolean, message: string}} An object with success indicating the success of the pitch creation, and message holding either the successfully created pitch ID or an error message
 */
export const createPitch = async (pitch: Pitch) => {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated) {
    return { success: false, message: 'User not authenticated' };
  }

  const dividendPayoutDate: Date = calculateDividendPayoutDate(pitch.dividendPayoutPeriod, pitch.endDate);

  const [insertedPitch] = await db.insert(BusinessPitchs).values({
    BusAccountID: userId,
    statusOfPitch: pitch.status,
    ProductTitle: pitch.title,
    ElevatorPitch: pitch.elevatorPitch,
    DetailedPitch: pitch.detailedPitch,
    TargetInvAmount: pitch.targetAmount,
    InvestmentStart: pitch.startDate,
    InvestmentEnd: pitch.endDate,
    InvProfShare: 0, // to be added later if profit share is implemented
    pricePerShare: "0", // think this is calculated, not needed as an input?
    bronseTierMulti: pitch.bronzeMultiplier,
    bronseInvMax: pitch.bronzeMax,
    silverTierMulti: pitch.silverMultiplier,
    silverInvMax: pitch.silverMax,
    goldTierMulti: pitch.goldMultiplier,
    goldTierMax: parseInt(pitch.targetAmount),
    dividEndPayout: dividendPayoutDate, // this needs to be calculated based on the dividend period
    DividEndPayoutPeriod: pitch.dividendPayoutPeriod,
    Tags: pitch.tags || [],
  }).returning();


  // update the database with the media url based on pitch ID
  const mediaURL = `${process.env.NEXT_PUBLIC_BUCKET_URL}/${insertedPitch.BusPitchID}`
  await db.update(BusinessPitchs).set({ SuportingMedia: mediaURL }).where(eq(BusinessPitchs.BusPitchID, insertedPitch.BusPitchID))
  return { success: true, message: mediaURL }
}

/**
 * Calcualte the dividend payout date based on the funding end date and the dividend period
 * @param period Lenght of the period
 * @param end End date of the pitch
 * @returns The payout date
 */
function calculateDividendPayoutDate(period: string, end: Date) {
  const payoutDate = new Date(end)
  if (period == "quarterly") {
    payoutDate.setFullYear(payoutDate.getFullYear(), payoutDate.getMonth() + 4)
  } else if (period == "yearly") {
    payoutDate.setFullYear(payoutDate.getFullYear() + 1)
  }
  return payoutDate
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

//app/api/evaluatePitch/route.ts
export async function evaluatePitchServer(pitchData: {
  title: string;
  elevatorPitch: string;
  detailedPitch: string;
  goal: string;
  dividendPeriod: string;
  startDate: Date;
  endDate: Date;
  bronzeMultiplier: string;
  bronzeMax: number;
  silverMultiplier: string;
  silverMax: number;
  goldMultiplier: string;
}) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  //Compose instructions for structured JSON output to parse through into object
  const instructions = `
You are an expert business analyst AI evaluating startup pitches.
Return a JSON object with:
{
  "feedback": {
    "overallAssessment": "Concise professional paragraph.",
    "clarity": { "score": 1-5, "comments": ["..."] },
    "viability": { "score": 1-5, "comments": ["..."] },
    "appeal": { "score": 1-5, "comments": ["..."] }
  },
  "ragScore": "Red" | "Amber" | "Green"
}
Use the pitch data below to generate the JSON.
`;

  const formattedPitch = `
Pitch Title: ${pitchData.title}
Elevator Pitch: ${pitchData.elevatorPitch}
Detailed Pitch: ${pitchData.detailedPitch}

Funding Goal: $${pitchData.goal}
Dividend Period: ${pitchData.dividendPeriod}
Start Date: ${pitchData.startDate}
End Date: ${pitchData.endDate}

Tier Structure:
- Bronze: Max $${pitchData.bronzeMax}, Multiplier ${pitchData.bronzeMultiplier}
- Silver: Max $${pitchData.silverMax}, Multiplier ${pitchData.silverMultiplier}
- Gold: Multiplier ${pitchData.goldMultiplier}
`;

  //enerate content
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [instructions, formattedPitch],
});

const rawText = response.text ?? "No response from AI";

//Remove ```json fences and trim whitespace
const cleanedText = rawText.replace(/```json|```/g, "").trim();

//Full fallback to satisfy TypeScript
const fallbackFeedback: AIFeedback = {
  overallAssessment: cleanedText,
  clarity: { score: 0, comments: ["No clarity information available."] },
  viability: { score: 0, comments: ["No viability information available."] },
  appeal: { score: 0, comments: ["No appeal information available."] },
};

try {
  const parsed: { feedback: AIFeedback; ragScore: "Red" | "Amber" | "Green" } =
    JSON.parse(cleanedText);
  console.log("Parsed AI Result:", parsed);
  return parsed;
} catch (err) {
  console.error("Failed to parse AI JSON:", err);
  return {
    feedback: fallbackFeedback,
    ragScore: "Amber",
  };
}
}
