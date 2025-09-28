import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { InvestmentLedger, BusinessPitchs, BusinessAccount } from '../../../../db/schema';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

/**
 * GET /api/investor/investments
 *
 * Returns all investments for the logged-in investor, including pitch and business details.
 *
 * Response format:
 * [
 *   {
 *     BusPitchID: number,
 *     ProductTitle: string,
 *     AmountInvested: string,
 *     TierOfInvestment: string,
 *     shares: number | null,
 *     BusAccountID: string,
 *     BusName: string,
 *     pricePerShare: string
 *   },
 *   ...
 * ]
 */
export async function GET(_req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not logged in' }, { status: 401 });
    }

    const investorId = user.id;

    // Join InvestmentLedger with BusinessPitchs and BusinessAccount
    const investments = await db
      .select({
        BusPitchID: InvestmentLedger.BusPitchID,
        ProductTitle: BusinessPitchs.ProductTitle,
        AmountInvested: InvestmentLedger.AmountInvested,
        TierOfInvestment: InvestmentLedger.TierOfInvestment,
        shares: InvestmentLedger.shares,
        BusAccountID: BusinessAccount.BusAccountID,
        BusName: BusinessAccount.BusName,
        pricePerShare: BusinessPitchs.pricePerShare
      })
      .from(InvestmentLedger)
      .innerJoin(BusinessPitchs, eq(InvestmentLedger.BusPitchID, BusinessPitchs.BusPitchID))
      .innerJoin(BusinessAccount, eq(BusinessPitchs.BusAccountID, BusinessAccount.BusAccountID))
      .where(eq(InvestmentLedger.InvestorID, investorId));

    return NextResponse.json(investments, { status: 200 });
  } catch (err) {
    console.error('Error fetching investor investments:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
