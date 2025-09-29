"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { Pitch } from "../../types/pitch";

type PitchCardProps = {
  pitch: Pitch;
};

export function PitchCard({ pitch }: PitchCardProps) {
  const progress = (pitch.currentAmount / pitch.pitchGoal) * 100;

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{pitch.pitchName}</CardTitle>
        <p className="text-sm text-muted-foreground">{pitch.pitchStatus}</p>
      </CardHeader>

      {/* Image should stretch across the whole card (ignore CardContent padding) */}
      <div className="relative w-full h-48">
        <Image
          src={pitch.pitchImageUrl}
          alt={pitch.pitchName}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <CardContent className="space-y-3">
        <Progress value={progress} className="w-full" />
        <p className="text-sm">
          {pitch.currentAmount} / {pitch.pitchGoal} raised
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
  );
}
