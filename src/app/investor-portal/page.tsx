/**
 * Investor Portal Page
 *
 * Displays the investor portal with a header linking back to the Launchpad.
 * Shows user account information when signed in via Clerk.
 */
import { SignedIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function InvestorPortal() {
  return (
    <main>
      <header>
        <div>
          <Link href="/">← Launchpad</Link>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <div>
        <h1>Investor Portal</h1>
      </div>
    </main>
  );
}