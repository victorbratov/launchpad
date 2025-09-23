
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <div style={{ textAlign: 'center' }}>
        <h1>Welcome to Launchpad</h1>
        <p>Choose your portal to get started</p>
        
        <SignedOut>
          <div>
            <p>Please sign in to continue</p>
            <SignInButton />
          </div>
        </SignedOut>
        
        <SignedIn>
          <div>
            <p>Welcome! You are signed in.</p>
            <UserButton />
          </div>
          
          <div>
            <Link href="/investor-portal">
              <button onClick={() => {}}>Investor Portal</button>
            </Link>
            
            <Link href="/business-portal">
              <button color="primary">Business Portal</button>
            </Link>
          </div>
        </SignedIn>
      </div>
    </main>
  );
}