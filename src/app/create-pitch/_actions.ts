"use server";

import { db } from "@/db";
import { business_pitches, business_accounts } from "@/db/schema";
import { NewBusinessPitch } from "@/db/types";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { calculateDividendPayoutDate, compareDates } from "@/lib/utils";

export interface Pitch {
  title: string;
  status: string;
  elevatorPitch: string;
  detailedPitch: string;
  targetAmount: number;
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
  advertMax: number;
}

export interface PitchInput {
  title: string;
  elevatorPitch: string;
  detailedPitch: string;
  targetAmount: number;
  profitSharePercentage: number;
  profitShareFrequency: "quarterly" | "yearly";
}

export interface PitchEvaluation {
  classification: "Red" | "Amber" | "Green";
  reasoning: string;
  recommendations: string[];
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

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

  const nextPayout = calculateDividendPayoutDate(
    pitch.dividendPayoutPeriod,
    pitch.endDate
  );

  let status = "active"

  const now = new Date();

  if (compareDates(pitch.startDate, now) == 1) {
    status = "upcoming"
  }

  const newPitch: NewBusinessPitch = {
    business_account_id: userId,
    status: status,
    product_title: pitch.title,
    elevator_pitch: pitch.elevatorPitch,
    detailed_pitch: pitch.detailedPitch,
    target_investment_amount: pitch.targetAmount,
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
    adverts_available: pitch.advertMax ? pitch.advertMax *100 : 0, // store as integer number of adverts, as each advert click costs 0.01
  };

  const [inserted] = await db.insert(business_pitches).values(newPitch).returning({
    pitch_id: business_pitches.pitch_id,
  });

  const mediaUrl = `${process.env.NEXT_PUBLIC_BUCKET_URL}/${inserted.pitch_id}`;
  await db
    .update(business_pitches)
    .set({ supporting_media: mediaUrl })
    .where(eq(business_pitches.pitch_id, inserted.pitch_id));

  return { success: true, message: mediaUrl };
}

/**
 * This function evaluates a business pitch using the OpenRouter API.
 * @param pitch - The pitch details to evaluate.
 * @returns {Promise<PitchEvaluation>} The evaluation result including classification, reasoning, and recommendations.
 */
export async function evaluatePitch(pitch: PitchInput): Promise<PitchEvaluation> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  if (!apiKey || !model) throw new Error("Missing environment configuration");

  const prompt = `
You are an expert crowdfunding pitch evaluator.

Evaluate the following startup pitch and classify it as Red, Amber, or Green (RAG) based on investment readiness and overall quality.
Provide reasoning and short actionable improvement recommendations.

Pitch details:
Title: ${pitch.title}
Elevator Pitch: ${pitch.elevatorPitch}
Detailed Description: ${pitch.detailedPitch}
Target Amount: $${pitch.targetAmount}
Profit Share: ${pitch.profitSharePercentage}% shared ${pitch.profitShareFrequency}ly.

Respond strictly as JSON like:
{
  "classification": "Red" | "Amber" | "Green",
  "reasoning": "string",
  "recommendations": ["string", "string", "string"]
}
`;

  const body = {
    model,
    messages: [
      { role: "user", content: prompt }
    ]
  };

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();

  console.log("OpenRouter response:", data);

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No message content in OpenRouter response");
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("Model returned non‑JSON output:", content);
    throw new Error("Failed to parse model response as JSON");
  }
}
