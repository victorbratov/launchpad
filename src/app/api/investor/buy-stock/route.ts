import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { InvestorAccounts, InvestmentLedger, BusinessPitchs } from '../../../../db/schema';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

/**
 * POST /api/investor/buy-stock
 *
 * Body:
 * {
 *   BusPitchID: number,
 *   amount: string
 * }
 *
 * Buys shares in a business pitch. Calculates shares as:
 * shares = amount * tierMultiplier / pricePerShare
 */
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not logged in' }, { status: 401 });
    }
    const investorId = user.id;

    const { BusPitchID, amount } = await req.json();
    if (!BusPitchID || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const investmentAmount = parseFloat(amount);
    if (isNaN(investmentAmount) || investmentAmount <= 0) {
      return NextResponse.json({ error: 'Invalid investment amount' }, { status: 400 });
    }

    // Fetch investor wallet
    const investor = await db
      .select({ wallet: InvestorAccounts.InvWallet })
      .from(InvestorAccounts)
      .where(eq(InvestorAccounts.InvestorID, investorId))
      .limit(1);

    if (investor.length === 0) {
      return NextResponse.json({ error: 'Investor account not found' }, { status: 404 });
    }

    const wallet = parseFloat(investor[0].wallet);
    if (investmentAmount > wallet) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // Fetch pitch info
    const pitch = await db
      .select()
      .from(BusinessPitchs)
      .where(eq(BusinessPitchs.BusPitchID, BusPitchID))
      .limit(1);

    if (pitch.length === 0) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 });
    }

    const p = pitch[0];

    // Determine tier based on investment amount
    let tier: 'bronze' | 'silver' | 'gold';
    let tierMultiplier: number;

    if (investmentAmount <= p.bronseInvMax) {
      tier = 'bronze';
      tierMultiplier = parseFloat(p.bronseTierMulti);
    } else if (investmentAmount <= p.silverInvMax) {
      tier = 'silver';
      tierMultiplier = parseFloat(p.silverTierMulti);
    } else {
      tier = 'gold';
      tierMultiplier = parseFloat(p.goldTierMulti);
    }

    // Calculate shares
    const shares = Math.floor((investmentAmount * tierMultiplier) / parseFloat(p.pricePerShare));

    if (shares <= 0) {
      return NextResponse.json({ error: 'Investment too small to buy shares' }, { status: 400 });
    }

    // Insert investment record
    await db.insert(InvestmentLedger).values({
      InvestorID: investorId,
      BusPitchID: BusPitchID,
      TierOfInvestment: tier,
      AmountInvested: investmentAmount.toFixed(2),
      shares: shares
    });

    // Update investor wallet
    await db
      .update(InvestorAccounts)
      .set({ InvWallet: (wallet - investmentAmount).toFixed(2) })
      .where(eq(InvestorAccounts.InvestorID, investorId));

    return NextResponse.json({ success: true, sharesBought: shares, tier }, { status: 201 });
  } catch (err) {
    console.error('Error buying stock:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
