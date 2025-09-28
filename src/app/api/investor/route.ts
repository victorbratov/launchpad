import { db } from "@/db";
import { InvestorAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from '@clerk/nextjs/server';


export async function GET() {

  const user = await currentUser();
  const userID = user?.id;

  if (userID == null) {
    return new Response('User not logged in', { status: 400 });
  }

  const investorData = await db.select().from(InvestorAccounts).where(eq(InvestorAccounts.InvestorID, userID));

  if (investorData.length === 0 || investorData.length > 1) {
    return new Response('Investor not found or multiple records found', { status: 404 });
  }

  return Response.json(investorData[0]);
}
