"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      {/* Logo */}
      <Link
        href="/"
        className="text-xl font-extrabold tracking-tight flex items-center gap-2"
      >
        <span className="text-primary">🚀</span> Launchpad
      </Link>

      {/* Middle nav links */}
      <div className="hidden md:flex items-center gap-6">
        <Link
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          href="/pitches"
        >
          Discover Pitches
        </Link>
        <Link
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          href="/investor-portal"
        >
          Personal Portal
        </Link>
      </div>

      {/* Right-side auth buttons */}
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">Sign Up</Button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        {/* Mobile menu (only appears < md) */}
        <button className="md:hidden p-2 rounded-md hover:bg-muted">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
