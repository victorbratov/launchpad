'use server'

import { db } from '@/db';
import { BusinessAccount, InvestorAccounts, TheBank } from '@/db/schema';
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const completeOnboarding = async (role: string, name: string, bank_account_number: string) => {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated) {
    return { success: false, message: 'User not authenticated' };
  }

  const clerkUser = await currentUser();
  const client = await clerkClient();

  if (clerkUser?.publicMetadata?.onboardingComplete) {
    redirect("/");
  }

  if (role === 'investor') {
    // store the businesses bank account in the bank table as this is needed to create the account
    await db.insert(TheBank).values({
      BankAccountNumber: bank_account_number,
      Ballance: '0.00'
    });

    await db.insert(InvestorAccounts).values({
      InvestorID: userId,
      InvEmail: clerkUser?.emailAddresses[0]?.emailAddress || '',
      InvName: name,
      InvBankACNumber: bank_account_number,
      InvWallet: '0.00'
    });
  } else if (role === 'business') {
    // store the businesses bank account in the bank table as this is needed to create the account
    await db.insert(TheBank).values({
      BankAccountNumber: bank_account_number,
      Ballance: '0.00'
    });

    await db.insert(BusinessAccount).values({
      BusAccountID: userId,
      BusEmail: clerkUser?.emailAddresses[0]?.emailAddress || '',
      BusName: name,
      BusBankAcc: bank_account_number,
      BusWallet: '0.00'
    });
  }

  await client.users.updateUser(userId, {
    publicMetadata: { onboardingComplete: true },
  })

  redirect("/")
}
