"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem, type CarouselApi
} from "@/components/ui/carousel";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card } from "./ui/card";

type MediaCarouselProps = {
  media: string[];
};

/**
 * This component displays a carousel of media items (images and videos) with navigation controls and thumbnails.
 * */
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
                    preload="metadata"
                    className="w-full h-full object-cover transition-transform duration-300"
                    onError={(e) => console.error('Video load error:', e)}
                    onLoadStart={() => console.log('Video loading started')}
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

                <div className="absolute pointer-events-none inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  {idx + 1} / {media.length}
                </div>

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

      </Carousel>

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
