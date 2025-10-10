"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import { BusinessPitch } from "@/db/types";
import { fetchFeaturedMedia } from "@/lib/s3_utils";
import { useEffect, useState } from "react";
import { updateAdvertCount } from "@/app/actions";
import { cn } from "@/lib/utils";

type PitchCardProps = {
  pitch: BusinessPitch;
};

export function PitchCard({ pitch }: PitchCardProps) {
  const progress = (pitch.raised_amount / pitch.target_investment_amount) * 100;
  const [media, setMedia] = useState<string | null>()

  useEffect(() => {
    async function loadMedia() {
      const mediaUrl = await fetchFeaturedMedia(pitch.pitch_id);

      setMedia(mediaUrl);
    }
    loadMedia();
  })

  return (
    <Link href={`/pitches/${pitch.instance_id}`} className="group">
      <Card
        className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white shadow-lg group-hover:shadow-blue-500/10"
        onClick={() => { pitch.adverts_available > 0 && updateAdvertCount(pitch.instance_id) }}
      >
        {media && (
          <div className="relative w-full h-56 overflow-hidden">
            {media.endsWith(".mp4") ? (
              <video
                src={media}
                controls
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <Image
                src={media}
                alt={pitch.product_title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4">
              <div className="flex items-center justify-between text-white text-sm mb-2">
                <span className="font-medium">
                  ${pitch.raised_amount?.toLocaleString()}
                </span>
                <span className="text-white/80">
                  {progress.toFixed(0)}% funded
                </span>
              </div>
              <Progress
                value={progress}
                className="w-full h-2 bg-white/20"
              />
            </div>

            <div className="absolute top-3 right-3">
              {media.endsWith(".mp4") ? (
                <div className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}

        <CardHeader className={cn("pb-3", !media && "pt-8 pb-6")}>
          <div className="space-y-3">

            <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
              {pitch.product_title}
            </CardTitle>

            {pitch.elevator_pitch && (
              <p className={cn(
                "text-sm text-slate-600 leading-relaxed",
                media ? "line-clamp-2" : "line-clamp-3"
              )}>
                {pitch.elevator_pitch}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className={cn("space-y-4 flex-1 flex flex-col", !media && "pt-0")}>
          {!media && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900">
                  ${pitch.raised_amount?.toLocaleString()}
                </span>
                <span className="text-slate-600">
                  {progress.toFixed(0)}% funded
                </span>
              </div>
              <Progress
                value={progress}
                className="w-full h-3"
              />
              <p className="text-xs text-slate-500 text-center">
                ${(pitch.target_investment_amount - pitch.raised_amount)?.toLocaleString()} remaining of ${pitch.target_investment_amount?.toLocaleString()} goal
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">
                Target
              </p>
              <p className="font-bold text-slate-900">
                ${pitch.target_investment_amount?.toLocaleString()}
              </p>
            </div>

            <div className="bg-emerald-50 rounded-lg p-3">
              <p className="text-emerald-600 text-xs font-medium uppercase tracking-wide mb-1">
                Profit Share
              </p>
              <p className="font-bold text-emerald-700">
                {pitch.investor_profit_share_percent?.toFixed(1)}%
              </p>
            </div>
          </div>

          {pitch.end_date && new Date(pitch.end_date) > new Date() && (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">
                    Time Left
                  </span>
                </div>
                <p className="font-semibold text-amber-800 text-sm">
                  {Math.ceil((new Date(pitch.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
          )}

          {pitch.tags && pitch.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
              {pitch.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors duration-200 border border-slate-200"
                >
                  {tag}
                </Badge>
              ))}
              {pitch.tags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-slate-100 text-slate-500 border border-slate-200"
                >
                  +{pitch.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>View Details</span>
              </div>

              <div className="flex items-center gap-1 text-blue-600 font-medium text-sm group-hover:gap-2 transition-all duration-200">
                <span>Invest</span>
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    </Link>
  );
}
