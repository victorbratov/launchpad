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
import { Menu, MenuIcon } from "lucide-react";


/**
 * This is the Navbar component
 * */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent hydration mismatch by not rendering animations until mounted
  if (!isMounted) {
    return (
      <nav className="backdrop-blur-lg bg-white/95 border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16 relative">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">🚀</span>
              </div>
              <span className="text-xl text-slate-800 font-bold">Launchpad</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
              <Link href="/pitches" className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors duration-200 rounded-lg hover:bg-blue-50">
                Discover Pitches
              </Link>
              <Link href="/portal_redirect" className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors duration-200 rounded-lg hover:bg-blue-50">
                Personal Portal
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Sign Up
                  </Button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>

            <div className="md:hidden flex items-center space-x-4">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <button className="text-slate-700 hover:text-blue-600 p-2">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={
      `backdrop-blur-lg sticky top-0 z-50 transition-all duration-300 
      ${scrolled
        ? "bg-white/95 border-b border-slate-200/50 shadow-lg"
        : "bg-white/90 border-b border-slate-200/30 shadow-sm"}`
    }>
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16 relative">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-xl transform transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-12">
                  🚀
                </span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl text-slate-800 font-bold group-hover:text-blue-600 transition-colors duration-200">
                Launchpad
              </span>
              <span className="text-xs text-slate-500 -mt-1 hidden sm:block">
                Fund Innovation
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-1 bg-slate-100/50 rounded-xl p-1 backdrop-blur-sm">
              <Link
                href="/pitches"
                className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-all duration-200 rounded-lg hover:bg-white hover:shadow-sm relative group"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Discover Pitches
                </span>
              </Link>
              <Link
                href="/portal_redirect"
                className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-all duration-200 rounded-lg hover:bg-white hover:shadow-sm relative group"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Portal
                </span>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-medium"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                >
                  Get Started
                </Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <div className="relative">
                <div className="inline-flex rounded-full ring-2 ring-blue-200 hover:ring-blue-300 transition-all duration-200 bg-white shadow-sm">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "rounded-full hover:scale-105 transition-transform duration-200",
                        avatarImage: "w-10 h-10"
                      }
                    }}
                  />
                </div>
              </div>
            </SignedIn>
          </div>

          <div className="md:hidden flex items-center space-x-3">
            <SignedIn>
              <div className="inline-flex rounded-full ring-2 ring-blue-200 bg-white shadow-sm">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "rounded-full",
                      avatarImage: "w-9 h-9"
                    }
                  }}
                />
              </div>
            </SignedIn>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-700 hover:text-blue-600 transition-all duration-200 hover:bg-slate-100 rounded-lg p-2 relative"
            >
              <MenuIcon />
            </button>
          </div>
        </div>

        <div
          className={
            `md:hidden overflow-hidden transition-all duration-300 ease-in-out 
            ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`
          }
        >
          <div className="px-2 pt-2 pb-4 space-y-2 bg-white/95 backdrop-blur-sm border-t border-slate-200/50 rounded-b-2xl shadow-lg mx-2 mb-2">
            <Link
              href="/pitches"
              className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Discover Pitches</p>
                <p className="text-xs text-slate-500">Browse investment opportunities</p>
              </div>
            </Link>

            <Link
              href="/portal_redirect"
              className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Personal Portal</p>
                <p className="text-xs text-slate-500">Manage your investments</p>
              </div>
            </Link>

            <SignedOut>
              <div className="px-4 pt-2 space-y-3 border-t border-slate-200/50 mt-2">
                <div onClick={() => setIsOpen(false)}>
                  <SignInButton mode="modal">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                </div>
                <div onClick={() => setIsOpen(false)}>
                  <SignUpButton mode="modal">
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Get Started
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
