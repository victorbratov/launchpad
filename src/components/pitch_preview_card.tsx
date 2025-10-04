"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { Pitch } from "../../types/pitch";
import Link from "next/link";

type PitchCardProps = {
  pitch: Pitch;
};

export function PitchCard({ pitch }: PitchCardProps) {
  const progress = (pitch.currentAmount / pitch.pitchGoal) * 100;

  return (
    <Link href={`/pitches/${pitch.pitchID}`}>
      <Card className="flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>{pitch.pitchName}</CardTitle>
          <p className="text-sm text-muted-foreground">{pitch.pitchStatus}</p>
        </CardHeader>

        {/* Image should stretch across the whole card (ignore CardContent padding) */}
        <div className="relative w-full h-48">
          {pitch.pitchImageUrl && pitch.pitchImageUrl.endsWith(".mp4") ? (
            <video
              src={pitch.pitchImageUrl}
              controls
              className="h-48 w-full object-contain bg-black rounded-md"
            />
          ) : (
            <Image
              src={pitch.pitchImageUrl ?? "/nasa-dCgbRAQmTQA-unsplash.jpg"}
              alt={pitch.pitchName}
              fill
              className="object-contain"
              unoptimized
            />)}
        </div>

        <CardContent className="space-y-3">
          <Progress value={progress} className="w-full" />
          <p className="text-sm">
            {pitch.currentAmount} / {pitch.pitchGoal}
          </p>
          <div className="flex flex-wrap gap-2">
            {pitch.tags.map((tag) => (
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
