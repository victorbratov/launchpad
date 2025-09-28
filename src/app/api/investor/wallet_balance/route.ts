import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { InvestorAccounts, BusinessAccount } from '../../../../db/schema';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

/**
 * GET /api/investor/wallet_balance
 *
 * Auto-detects whether the logged-in user has an investor or business account
 * and returns their account balance along with their account ID.
 *
 * Responses:
 * - 200: { balance: string, accountId: string }
 * - 401: { error: 'User not logged in' }
 * - 404: { error: 'Account not found' }
 * - 500: { error: 'Internal server error' }
 */
export async function GET(_req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not logged in' }, { status: 401 });
    }
    const userId = user.id;

    // Try investor account first
    const investorRows = await db
      .select({
        balance: InvestorAccounts.InvWallet,
        accountId: InvestorAccounts.InvestorID
      })
      .from(InvestorAccounts)
      .where(eq(InvestorAccounts.InvestorID, userId))
      .limit(1);

    if (investorRows.length > 0) {
      return NextResponse.json(
        { balance: investorRows[0].balance, accountId: investorRows[0].accountId },
        { status: 200 }
      );
    }

    // Try business account next
    const businessRows = await db
      .select({
        balance: BusinessAccount.BusWallet,
        accountId: BusinessAccount.BusAccountID
      })
      .from(BusinessAccount)
      .where(eq(BusinessAccount.BusAccountID, userId))
      .limit(1);

    if (businessRows.length > 0) {
      return NextResponse.json(
        { balance: businessRows[0].balance, accountId: businessRows[0].accountId },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  } catch (err) {
    console.error('Error fetching account balance:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
