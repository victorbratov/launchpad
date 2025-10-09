"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { lato } from "@/app/font"; // wherever your fonts.ts is


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering animations until mounted
  if (!isMounted) {
    return (
      <nav className="border-b border-black bg-[#677DB7] sticky top-0 z-50">

        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            {/* Logo - Far Left */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <span className="text-xl text-white font-bold hover:text-gray-300 ">Launchpad</span>
            </Link>

            {/* Desktop Menu - Centered */}
            <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
              <Link href="/pitches" className={`text-white hover:text-gray-300 transition-colors duration-200 font-bold ${lato.className}`}>
                Discover Pitches
              </Link>
              <Link
                href="/portal_redirect"
                className={`text-white hover:text-gray-300 transition-colors duration-200 font-bold ${lato.className}`}
              >
                Personal Portal
              </Link>
            </div>

            {/* Desktop Auth Buttons - Far Right */}
            <div className="hidden md:flex items-center space-x-3">
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
                <UserButton />
              </SignedIn>
            </div>

            {/* Mobile - UserButton and Menu Button at Far Right */}
            <div className="md:hidden flex items-center space-x-4">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <button className="text-white hover:text-gray-300 p-1">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-gray-500 bg-[#677DB7] sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          {/* Logo - Far Left */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-12">
              🚀
            </span>
            <span className="text-xl text-white font-bold">Launchpad</span>
          </Link>


          {/* Desktop Menu - Centered */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/pitches"
              className={`text-white hover:text-gray-300 transition-colors duration-200 font-bold ${lato.className}`}
            >
              Discover Pitches
            </Link>
            <Link
              href="/portal_redirect"
              className={`text-white hover:text-gray-300 transition-colors duration-200 font-bold ${lato.className}`}
            >
              Personal Portal
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
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
              <div className="inline-flex rounded-full ring-2 ring-white">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "rounded-full",
                      avatarImage: "w-12 h-12" // set width and height
                    }
                  }}
                />
              </div>


            </SignedIn>
          </div>

          {/* Mobile - UserButton and Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <SignedIn>
              <div className="inline-flex rounded-full ring-2 ring-white">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "rounded-full",
                      avatarImage: "w-12 h-12" // set width and height
                    }
                  }}
                />
              </div>


            </SignedIn>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gray-300 transition-colors duration-200 hover:bg-gray-100 rounded-md p-1"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 border-t bg-white">
            <Link
              href="/pitches"
              className="block px-3 py-2 text-black hover:text-gray-300 hover:bg-gray-50 rounded-md transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              Discover Pitches
            </Link>
            <Link
              href="/portal_redirect"
              className="block px-3 py-2 text-black hover:text-gray-300 hover:bg-gray-50 rounded-md transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              Personal Portal
            </Link>

            <SignedOut>
              <div className="px-3 py-2 space-y-2">
                <div onClick={() => setIsOpen(false)}>
                  <SignInButton mode="modal">
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </SignInButton>
                </div>
                <div onClick={() => setIsOpen(false)}>
                  <SignUpButton mode="modal">
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </div>
              </div>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
}
