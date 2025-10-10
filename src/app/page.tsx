"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Rocket, Bot, ArrowRight, Star, Users, DollarSign } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getAdvertisementPitches, updateAdvertCount } from "./actions";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Advert } from "../../types/advert";
import Autoplay from "embla-carousel-autoplay"
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAdverts = async () => {
      try {
        const adverts = await getAdvertisementPitches();
        setAdverts(adverts);
        console.log("Fetched adverts:", adverts);
      } catch (error) {
        console.error("Error fetching advertisement pitches:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdverts();
  }, []);

  async function advertClicked(advertID: string) {
    try {
      await updateAdvertCount(advertID);
    } catch (error) {
      console.error("Error updating advert count:", error);
    }
    router.push(`/pitches/${advertID}`);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

        <div className="container mx-auto px-6 py-16 sm:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Rocket className="w-4 h-4" />
              AI-Powered Business Launchpad
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              Launch Your Dream
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Business Today
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Connect innovative businesses with smart investors. Create compelling pitches with AI assistance,
              discover vetted opportunities, and build the future together.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/pitches">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                  Discover Pitches
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <SignUpButton mode="redirect">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2">
                  Start Your Journey
                </Button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Pitches Carousel - Full Width */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-6 mb-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Featured <span className="text-blue-600">Opportunities</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Discover hand-picked investment opportunities from innovative businesses
            </p>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : adverts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Rocket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No featured pitches available at the moment.</p>
            </div>
          ) : (
            <Carousel
              opts={{
                align: "start",
                loop: true,
                skipSnaps: false,
                dragFree: true,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {adverts.map((advert, index) => (
                  <CarouselItem
                    key={advert.instance_id}
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <Card
                      className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg overflow-hidden bg-white"
                      onClick={() => advertClicked(advert.instance_id)}
                    >
                      <div className="relative overflow-hidden">
                        {advert.media &&
                          <Image
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            src={advert.media || "/nasa-dCgbRAQmTQA-unsplash.jpg"}
                            alt={advert.title}
                            width={400}
                            height={200}
                          />
                        }
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                            Featured
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {advert.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                          {advert.elevator_pitch}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>Investors</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>Funding</span>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <div className="hidden md:block">
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm border-2 hover:bg-white shadow-lg" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm border-2 hover:bg-white shadow-lg" />
              </div>
            </Carousel>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose <span className="text-blue-600">Launchpad?</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Our platform combines cutting-edge AI technology with human expertise to create the perfect environment for business growth
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Bot className="w-12 h-12 text-blue-600" />}
              title="AI Pitch Assistant"
              description="Create compelling, professional pitches in minutes with our advanced AI technology that understands what investors want to see."
            />
            <FeatureCard
              icon={<Rocket className="w-12 h-12 text-purple-600" />}
              title="Investor Marketplace"
              description="Connect with a curated network of private investors actively seeking innovative business opportunities in your industry."
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12 text-green-600" />}
              title="Fraud Prevention"
              description="Advanced verification systems and due diligence processes protect both entrepreneurs and investors from fraudulent activities."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How <span className="text-blue-600">Launchpad</span> Works
            </h2>
            <p className="text-gray-600 text-lg">
              Three simple steps to transform your business idea into reality
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid gap-8 md:gap-12 lg:grid-cols-3">
              <ProcessStep
                number="01"
                title="Create Your Pitch"
                description="Use our AI-powered tools to craft a compelling business pitch that highlights your unique value proposition and market opportunity."
                color="blue"
              />
              <ProcessStep
                number="02"
                title="Connect with Investors"
                description="Publish your pitch to our exclusive marketplace where verified investors can discover and evaluate your business opportunity."
                color="purple"
              />
              <ProcessStep
                number="03"
                title="Secure Funding"
                description="Build relationships with investors, negotiate terms, and secure the funding you need to take your business to the next level."
                color="green"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <SignUpButton>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </SignUpButton>
            <Link href="/pitches">
              <Button size="lg" variant="outline" className="border-2 border-white text-black hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                Explore Opportunities
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
      <CardContent className="p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function ProcessStep({ number, title, description, color }: {
  number: string;
  title: string;
  description: string;
  color: 'blue' | 'purple' | 'green';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600'
  };

  return (
    <div className="text-center lg:text-left">
      <div className="flex justify-center lg:justify-start mb-6">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${colorClasses[color]}`}>
          {number}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
