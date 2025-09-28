import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import { InvestorAccounts, BusinessAccount } from '../../../db/schema';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

/**
 * Request payload for creating an account.
 */
interface CreateAccountRequest {
  userRole: 'investor' | 'business_owner';
  email: string;
  name: string;
  bank_account_number: string;
}

/**
 * Handles POST requests to create an account (Investor or Business Owner).
 *
 * @param req - The incoming Next.js request object.
 * @returns A JSON response with success or error details.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not logged in' }, { status: 401 });
    }

    const userId = user.id;
    const { userRole, email, name, bank_account_number }: CreateAccountRequest = await req.json();

    if (!userRole || !email || !name || !bank_account_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let existingAccount: unknown[];

    if (userRole === 'investor') {
      existingAccount = await db
        .select()
        .from(InvestorAccounts)
        .where(eq(InvestorAccounts.InvestorID, userId))
        .limit(1);
    } else if (userRole === 'business_owner') {
      existingAccount = await db
        .select()
        .from(BusinessAccount)
        .where(eq(BusinessAccount.BusAccountID, userId))
        .limit(1);
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
    }

    if (existingAccount.length > 0) {
      return NextResponse.json(
        { error: 'Account for this user already exists' },
        { status: 409 }
      );
    }

    if (userRole === 'investor') {
      await db.insert(InvestorAccounts).values({
        InvestorID: userId,
        InvEmail: email,
        InvName: name,
        InvBankACNumber: bank_account_number,
        InvWallet: '0.00',
      });
    } else {
      await db.insert(BusinessAccount).values({
        BusAccountID: userId,
        BusEmail: email,
        BusName: name,
        BusBankAcc: bank_account_number,
        BusWallet: '0.00',
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
