/**
 * Business Portal Page
 *
 * Displays the business portal for signed-in users.
 * Includes a header with navigation back to Launchpad and user account button.
 */

import { SignedIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
/**
 * BusinessPortal Page Component
 * @returns JSX.Element
 */
export default function BusinessPortal() {
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
        <h1>Business Portal</h1>
      </div>
    </main>
  );
}