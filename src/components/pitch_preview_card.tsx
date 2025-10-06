"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import { BusinessPitch } from "@/db/types";

type PitchCardProps = {
  pitch: BusinessPitch;
};

export function PitchCard({ pitch }: PitchCardProps) {
  const progress = (pitch.raised_amount / pitch.target_investment_amount) * 100;

  return (
    <Link href={`/pitches/${pitch.instance_id}`}>
      <Card className="flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>{pitch.product_title}</CardTitle>
          <p className="text-sm text-muted-foreground">{pitch.status}</p>
        </CardHeader>

        {/* Image should stretch across the whole card (ignore CardContent padding) */}
        <div className="relative w-full h-48">
          {pitch.supporting_media && pitch.supporting_media.endsWith(".mp4") ? (
            <video
              src={pitch.supporting_media}
              controls
              className="h-48 w-full object-contain bg-black rounded-md"
            />
          ) : (
            <Image
              src={pitch.supporting_media ?? "/nasa-dCgbRAQmTQA-unsplash.jpg"}
              alt={pitch.product_title}
              fill
              className="object-contain"
              unoptimized
            />)}
        </div>

        <CardContent className="space-y-3">
          <Progress value={progress} className="w-full" />
          <p className="text-sm">
            {pitch.raised_amount} / {pitch.target_investment_amount}
          </p>
          <div className="flex flex-wrap gap-2">
            {pitch.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
