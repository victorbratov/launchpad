
'use client';

import {  SignedIn, SignedOut, SignOutButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.unsafeMetadata?.role;
      
      // Auto-redirect based on role if they have one set
      if (userRole === 'investor') {
        router.push('/investor-portal');
      } else if (userRole === 'business_owner') {
        router.push('/business-portal');
      }
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <div>
        <h1>Welcome to Launchpad</h1>
        
        
        <SignedOut>
          <div>
            <p>Please sign in to continue</p>
            <Link href="/sign-in">
              <button>Sign In</button>
            </Link>
            <p>
              Don&apos;t have an account? <Link href="/sign-up">Sign Up</Link>
            </p>
          </div>
        </SignedOut>
        
        <SignedIn>
          <div>
            <p>Welcome! You are signed in.</p>
            <UserButton />
          </div>
          
          <div>
            <SignOutButton>
              Sign Out
            </SignOutButton>
          </div>

        </SignedIn>
      </div>
    </main>
  );
}