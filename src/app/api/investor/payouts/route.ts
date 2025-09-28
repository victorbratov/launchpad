import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { DividendPayouts, BusinessPitchs, BusinessAccount } from '../../../../db/schema';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

/**
 * GET /api/investor/dividends
 *
 * Returns all dividend payouts for the logged-in investor.
 *
 * Response format:
 * [
 *   {
 *     BusPitchID: number,
 *     ProductTitle: string,
 *     BusAccountID: string,
 *     BusName: string,
 *     DividendAmount: string,
 *     DataPayedOut: string
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

    // Join DividendPayouts with BusinessPitchs and BusinessAccount
    const dividends = await db
      .select({
        BusPitchID: DividendPayouts.BusPitchID,
        ProductTitle: BusinessPitchs.ProductTitle,
        BusAccountID: BusinessAccount.BusAccountID,
        BusName: BusinessAccount.BusName,
        DividendAmount: DividendPayouts.DividenndAmount,
        DataPayedOut: DividendPayouts.DataPayedOut
      })
      .from(DividendPayouts)
      .innerJoin(BusinessPitchs, eq(DividendPayouts.BusPitchID, BusinessPitchs.BusPitchID))
      .innerJoin(BusinessAccount, eq(DividendPayouts.BusAccountID, BusinessAccount.BusAccountID))
      .where(eq(DividendPayouts.InvestorID, investorId));

    return NextResponse.json(dividends, { status: 200 });
  } catch (err) {
    console.error('Error fetching dividend payouts:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
