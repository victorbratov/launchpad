
import { investmentLedger } from "../../../migrations/schema";
import { db } from "../../db";
import { BusinessPitchs, InvestmentLedger } from "../schema";
import { eq } from "drizzle-orm";
import { InferInsertModel, InferSelectModel, exists } from "drizzle-orm";

type NewBusinessPitch = InferInsertModel<typeof BusinessPitchs>;
type BusinessPitchRow = InferSelectModel<typeof BusinessPitchs>;
//type InvestmentLedgerRow = InferSelectModel<typeof InvestmentLedger>;




export async function createBusinessPitch(
  data: NewBusinessPitch
): Promise<BusinessPitchRow> {
  const [inserted] = await db
    .insert(BusinessPitchs)
    .values(data)
    .returning();

  return inserted;
}

export async function showAllBusinessPitches(
): Promise<BusinessPitchRow[]>{

  const pitches = await db
  .select()
  .from(BusinessPitchs)

  return pitches

}


export async function getTotalMoneyInvested(
): Promise<{busPitchID: number, totalAmount: number}[]>{

  const investments = await db
  .select()
  .from(InvestmentLedger)

  // Group investments by pitch ID and calculate totals
  const pitchTotals = investments.reduce((acc, investment) => {
    const pitchId = investment.BusPitchID;
    if (!acc[pitchId]) {
      acc[pitchId] = 0;
    }
    acc[pitchId] += Number(investment.AmountInvested);
    return acc;
  }, {} as Record<number, number>);

  // Convert to array format
  return Object.entries(pitchTotals).map(([pitchId, total]) => ({
    busPitchID: Number(pitchId),
    totalAmount: total
  }));

}