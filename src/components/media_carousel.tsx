"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card } from "./ui/card";

type MediaCarouselProps = {
  media: string[];
};

export function MediaCarousel({ media }: MediaCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <Card className="w-full bg-white">
      <Carousel
        setApi={setApi}
        className="w-full overflow-hidden relative group"
      >
        <CarouselContent>
          {media.map((m, idx) => (
            <CarouselItem key={idx} className="flex justify-center relative">
              <div className="relative w-full h-80 md:h-96 lg:h-[500px] rounded-xl overflow-hidden">
                {m.endsWith(".mp4") ? (
                  <video
                    src={m}
                    controls
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    poster="" // You can add a poster image if available
                  />
                ) : (
                  <Image
                    src={m}
                    alt={`Pitch Media ${idx + 1}`}
                    width={800}
                    height={500}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    unoptimized
                  />
                )}

                {/* Media overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

                {/* Media counter overlay */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  {idx + 1} / {media.length}
                </div>

                {/* Media type indicator */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wide">
                  {m.endsWith(".mp4") ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Video
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      Image
                    </span>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Enhanced Navigation Arrows */}
        <CarouselPrevious className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-800 border-0 shadow-lg h-12 w-12 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110" />
        <CarouselNext className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-800 border-0 shadow-lg h-12 w-12 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110" />

        {/* Progress bar */}
        {media.length > 1 && (
          <div className="absolute bottom-4 left-4 right-4 h-1 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/90 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((current + 1) / media.length) * 100}%` }}
            />
          </div>
        )}
      </Carousel>

      {/* Enhanced Dot Navigation */}
      {media.length > 1 && (
        <div className="flex justify-center items-center gap-3 px-4">
          <div className="flex justify-center gap-2 bg-white rounded-full p-3 shadow-lg border border-slate-200">
            {media.map((m, idx) => (
              <button
                key={idx}
                onClick={() => api?.scrollTo(idx)}
                className={cn(
                  "relative rounded-full transition-all duration-300 hover:scale-110",
                  current === idx
                    ? "w-8 h-3 bg-gradient-to-r from-blue-600 to-purple-600 shadow-md"
                    : "w-3 h-3 bg-slate-300 hover:bg-slate-400"
                )}
                aria-label={`Go to slide ${idx + 1}`}
              >
                {/* Active indicator */}
                {current === idx && (
                  <div className="absolute inset-0.5 bg-white/30 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Media navigation info */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
            <button
              onClick={() => api?.scrollNext()}
              disabled={!api?.canScrollNext()}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous media"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="font-medium min-w-[4rem] text-center">
              {current + 1} of {media.length}
            </span>

            <button
              onClick={() => api?.scrollNext()}
              disabled={!api?.canScrollNext()}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next media"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Thumbnail strip for larger screens */}
      {media.length > 1 && (
        <div className="hidden lg:flex justify-center gap-2 px-4">
          <div className="flex gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 max-w-md overflow-x-auto">
            {media.map((m, idx) => (
              <button
                key={idx}
                onClick={() => api?.scrollTo(idx)}
                className={cn(
                  "flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105",
                  current === idx
                    ? "border-blue-500 shadow-md"
                    : "border-transparent hover:border-slate-300"
                )}
              >
                {m.endsWith(".mp4") ? (
                  <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <Image
                    src={m}
                    alt={`Thumbnail ${idx + 1}`}
                    width={64}
                    height={48}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
