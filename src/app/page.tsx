"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Rocket, Bot } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getAdvertisementPitches } from "./actions";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Advert } from "../../types/advert";
import Autoplay from "embla-carousel-autoplay"


export default function LandingPage() {
  const [adverts, setAdverts] = useState<Advert[]>([]);
  useEffect(() => {
    const fetchAdverts = async () => {
      try {
        const adverts = await getAdvertisementPitches();
        setAdverts(adverts);

        console.log("Fetched adverts:", adverts);
      } catch (error) {
        console.error("Error fetching advertisement pitches:", error);
      }
    };
    fetchAdverts();
  }, []);


  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-20 sm:py-32 bg-gradient-to-b from-slate-50 to-white">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl">
          Launchpad<br />
          <span className="text-primary">Powered by AI</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
          Launchpad helps small businesses craft winning pitches with AI while
          empowering private investors to discover secure and fraud-free
          opportunities.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/pitches">
            <Button size="lg">Discover Pitches</Button>
          </Link>
          <SignUpButton mode="redirect">
            <Button size="lg" variant="outline">
              Get Started
            </Button>
          </SignUpButton>
        </div>

        {/* Advertisement space */}
        <div className="mt-12 relative w-full max-w-xs">
          <Carousel
            opts={{
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 3000,
              }),
            ]}
          >
            <CarouselContent className="flex gap-4">
              {adverts.map((advert) => (
                <CarouselItem key={advert.id} className="max-h-[400px] space-y-3 mx-1 items-center gap-4 p-4 border border-2 rounded-lg border-gray-400 bg-white shadow-md">
                  <Image className="rounded-lg object-contain" src={advert.media || "/nasa-dCgbRAQmTQA-unsplash.jpg"} alt={advert.title} width={500} height={300} />
                  <h3 className="text-lg font-semibold line-clamp-2">{advert.title}</h3>
                  <p className="line-clamp-5">{advert.elevator_pitch}</p>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselNext />
            <CarouselPrevious />
          </Carousel>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <Bot className="w-10 h-10 text-primary" />
            <h3 className="text-xl font-semibold">AI Pitch Assistance</h3>
            <p className="text-muted-foreground">
              Business owners get guided AI support to craft compelling,
              professional pitches with ease.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Rocket className="w-10 h-10 text-primary" />
            <h3 className="text-xl font-semibold">Investor Marketplace</h3>
            <p className="text-muted-foreground">
              Private investors discover vetted business opportunities in a
              transparent and user-friendly marketplace.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Shield className="w-10 h-10 text-primary" />
            <h3 className="text-xl font-semibold">Fraud Prevention</h3>
            <p className="text-muted-foreground">
              Our platform ensures verification of pitches, protecting both
              businesses and investors from fraud.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold">How Launchpad Works</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3 text-left">
          <div>
            <h4 className="font-semibold text-lg">1. AI-Assisted Pitches</h4>
            <p className="text-muted-foreground">
              Use AI tools to craft, refine, and polish your business pitch in
              minutes.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg">2. Share with Investors</h4>
            <p className="text-muted-foreground">
              Publish your pitch to our marketplace where private investors can
              explore and connect.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg">3. Grow Securely</h4>
            <p className="text-muted-foreground">
              With fraud-prevention mechanisms and trusted connections, you can
              grow your business safely.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-primary text-white text-center">
        <h2 className="text-3xl font-bold">
          Ready to launch your next big idea?
        </h2>
        <p className="mt-4 text-lg">
          Join Launchpad to create pitches, connect with investors, and build
          your future.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <SignUpButton>
            <Button size="lg" variant="secondary">
              Get Started
            </Button>
          </SignUpButton>
          <Link href="/pitches">
            <Button size="lg" variant="secondary">
              Explore Pitches
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
