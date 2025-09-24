
'use client';

import {  SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
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
        <p>Choose your portal to get started</p>
        
        <SignedOut>
          <div>
            <p>Please sign in to continue</p>
            <Link href="/sign-in">
              <button>Sign In</button>
            </Link>
            <p>
              Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
            </p>
          </div>
        </SignedOut>
        
        <SignedIn>
          <div>
            <p>Welcome! You are signed in.</p>
            <UserButton />
          </div>
          
          <div>
            <h2>Choose Your Portal:</h2>
            <Link href="/investor-portal">
              <button>Investor Portal</button>
            </Link>
            
            <Link href="/business-portal">
              <button>Business Portal</button>
            </Link>
          </div>
        </SignedIn>
      </div>
    </main>
  );
}