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
    <div className="w-full space-y-3">
      <Carousel
        setApi={setApi}
        className="w-full rounded-lg overflow-hidden relative"
      >
        <CarouselContent>
          {media.map((m, idx) => (
            <CarouselItem key={idx} className="flex justify-center">
              {m.endsWith(".mp4") ? (
                <video
                  src={m}
                  controls
                  className="w-full h-80 object-cover bg-black rounded-md"
                />
              ) : (
                <Image
                  src={m}
                  alt={`Pitch Media ${idx + 1}`}
                  width={800}
                  height={400}
                  className="w-full h-80 object-cover rounded-md"
                  unoptimized
                />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Show arrows only on md+ screens */}
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>

      <div className="flex justify-center gap-2">
        {media.map((_, idx) => (
          <button
            key={idx}
            onClick={() => api?.scrollTo(idx)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-colors",
              current === idx
                ? "bg-primary"
                : "bg-gray-400 hover:bg-muted-foreground/50"
            )}
          />
        ))}
      </div>

    </div>
  );
}
