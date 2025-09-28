'use server'

import { db } from '@/db';
import { BusinessAccount, InvestorAccounts } from '@/db/schema';
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
    return { success: true };
  }

  if (role === 'investor') {
    await db.insert(InvestorAccounts).values({
      InvestorID: userId,
      InvEmail: clerkUser?.emailAddresses[0]?.emailAddress || '',
      InvName: name,
      InvBankACNumber: bank_account_number,
      InvWallet: '0.00'
    });
  } else if (role === 'business') {
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
