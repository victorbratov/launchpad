'use server'

import { db } from '@/db';
import { bank_accounts, business_accounts, investor_accounts } from '@/db/schema';
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';

/**
 * this function completes the onboarding process for a user by creating either a business or investor account and associating it with a bank account.
 * @param role - 'business' or 'investor' to specify the type of account to create
 * @param name - the name of the user
 * @param bank_account_number - the bank account number to associate with the user
 * @throws Error if the user is not authenticated or if there are issues creating the accounts
 * */
export const completeOnboarding = async (
  role: 'business' | 'investor',
  name: string,
  bank_account_number: string
) => {
  const { userId, redirectToSignIn } = await auth();
  const user = await currentUser();
  const client = await clerkClient();

  if (userId === null) {
    return redirectToSignIn();
  }

  const userEmail = user?.emailAddresses[0]?.emailAddress;
  if (!userEmail) {
    throw new Error('User email not found');
  }

  await db.transaction(async (tx) => {
    const [bankAccount] = await tx
      .insert(bank_accounts)
      .values({
        account_number: bank_account_number,
      })
      .returning({ id: bank_accounts.id });

    if (!bankAccount) throw new Error('Failed to create bank account');

    if (role === 'business') {
      await tx.insert(business_accounts).values({
        id: userId,
        name,
        email: userEmail,
        bank_account_id: bankAccount.id,
        wallet_balance: 0,
      });
    } else {
      await tx.insert(investor_accounts).values({
        id: userId,
        name,
        email: userEmail,
        bank_account_id: bankAccount.id,
        wallet_balance: 0,
      });
    }
  });

  if (role === 'business') {
    await client.users.updateUser(userId, {
      publicMetadata: { role: 'business', onboardingComplete: true },
    })
  } else {
    await client.users.updateUser(userId, {
      publicMetadata: { role: 'investor', onboardingComplete: true },
    })
  }
};
