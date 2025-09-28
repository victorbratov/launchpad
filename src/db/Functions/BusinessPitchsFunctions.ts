
import { db } from "../../db";
import { BusinessPitchs } from "../schema";
import { eq } from "drizzle-orm";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";


type NewBusinessPitch = InferInsertModel<typeof BusinessPitchs>;
type BusinessPitchRow = InferSelectModel<typeof BusinessPitchs>;




export async function createBusinessPitch(
  data: NewBusinessPitch
): Promise<BusinessPitchRow> {
  const [inserted] = await db
    .insert(BusinessPitchs)
    .values(data)
    .returning();

  return inserted;
}

