"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import { MediaCarousel } from "@/components/media_carousel";
import { getPitchByInstanceId, getPitchVersions, investInPitch } from "./_actions";
import { BusinessPitch } from "@/db/types";
import { fetchAllMedia } from "@/lib/s3_utils";

function calculateShares(amount: number, pitch: BusinessPitch | null) {
  if (!pitch || amount <= 0) return { tier: null, shares: 0 };

  const { bronze_multiplier, silver_multiplier, gold_multiplier, silver_threshold, gold_threshold } = pitch;

  if (amount <= silver_threshold) {
    return { tier: "Bronze", shares: Math.floor(amount * bronze_multiplier) };
  } else if (amount <= gold_threshold) {
    return { tier: "Silver", shares: Math.floor(amount * silver_multiplier) };
  } else {
    return { tier: "Gold", shares: Math.floor(amount * gold_multiplier) };
  }
}

export default function PitchDetailsPage() {
  const params = useParams();
  const instanceId = params.id as string; // version-level ID

  const [pitch, setPitch] = useState<BusinessPitch | null>(null);
  const [versions, setVersions] = useState<BusinessPitch[]>([]);

  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [withdrawChoice, setIsToggled] = useState(false);

  const [media, setMedia] = useState<string[]>([]);
  const amount = parseFloat(input) || 0;

  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const pitchData = await getPitchByInstanceId(instanceId);
        if (!pitchData) {
          setMessage("Pitch not found.");
          return;
        }

        const versions = await getPitchVersions(pitchData.pitch_id);

        setPitch(pitchData);
        setVersions(versions);
        fetchAllMedia(pitchData.pitch_id).then((m) => setMedia(m));
      } catch (err) {
        console.error(err);
        setMessage("Error loading pitch data.");
      }
    }
    if (instanceId) load();
  }, [instanceId]);

  const { tier, shares } = calculateShares(amount, pitch);

  const handleInvest = async () => {
    if (!pitch) return;
    startTransition(async () => {
      try {
        const res = await investInPitch(pitch.instance_id, amount, withdrawChoice ? "bank_account" : "wallet"); // invest by instance_id
        setMessage(res.message);
      } catch (err: any) {
        console.error(err);
        setMessage(err.message || "Error investing.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-8">
          {media.length > 0 && (
            <div className="flex justify-center">
              <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-lg">
                <MediaCarousel media={media} />
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
                  {pitch?.product_title}
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  {pitch?.elevator_pitch}
                </p>
              </div>
              <div className="ml-6 text-right">
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <p className="text-sm text-emerald-600 font-medium">Profit Share</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {pitch?.investor_profit_share_percent.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center mb-6">
              <div className="w-1 h-8 bg-blue-500 rounded-full mr-4"></div>
              <h2 className="text-2xl font-bold text-slate-900">The Vision</h2>
            </div>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-line">
                {pitch?.detailed_pitch}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center mb-6">
              <div className="w-1 h-8 bg-amber-500 rounded-full mr-4"></div>
              <h2 className="text-2xl font-bold text-slate-900">Investment Terms</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">%</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">Profit Share</h3>
                </div>
                <p className="text-2xl font-bold text-amber-700">
                  {pitch?.investor_profit_share_percent.toFixed(2)}%
                </p>
                <p className="text-sm text-amber-600">of revenue</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">⏰</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">Dividends</h3>
                </div>
                <p className="text-lg font-bold text-blue-700">
                  {pitch?.dividend_payout_period}
                </p>
                <p className="text-sm text-blue-600">payout period</p>
              </div>

              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">📅</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">Funding Window</h3>
                </div>
                <p className="text-sm font-semibold text-emerald-700">
                  {pitch?.start_date!.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {pitch?.end_date!.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-emerald-600">{pitch?.start_date!.getFullYear()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <Card className="shadow-xl border-0 bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <CardTitle className="text-xl font-bold mb-2">
                  Invest in {pitch?.product_title}
                </CardTitle>
                <p className="text-blue-100 text-sm">Join the funding round</p>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Progress Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        ${pitch?.raised_amount?.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-600">raised</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-700">
                        ${pitch?.target_investment_amount?.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-600">goal</p>
                    </div>
                  </div>

                  <Progress
                    value={pitch?.raised_amount! / pitch?.target_investment_amount! * 100}
                    className="h-3 bg-slate-100"
                  />

                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 font-medium">
                      {((pitch?.raised_amount! / pitch?.target_investment_amount!) * 100).toFixed(1)}% funded
                    </span>
                    <span className="text-slate-600">
                      ${(pitch?.target_investment_amount! - pitch?.raised_amount!)?.toLocaleString()} left
                    </span>
                  </div>
                </div>

                {pitch && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 flex items-center">
                      <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                      Investment Tiers
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">🥉</span>
                          </div>
                          <div>
                            <p className="font-semibold text-amber-900">Bronze</p>
                            <p className="text-xs text-amber-700">up to ${pitch.silver_threshold?.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-800">{pitch.bronze_multiplier.toFixed(1)}×</p>
                          <p className="text-xs text-amber-600">multiplier</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-slate-400 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">🥈</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Silver</p>
                            <p className="text-xs text-slate-700">${(pitch.silver_threshold + 1)?.toLocaleString()} – ${pitch.gold_threshold?.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">{pitch.silver_multiplier.toFixed(1)}×</p>
                          <p className="text-xs text-slate-600">multiplier</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">🥇</span>
                          </div>
                          <div>
                            <p className="font-semibold text-yellow-900">Gold</p>
                            <p className="text-xs text-yellow-700">over ${pitch.gold_threshold?.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-yellow-800">{pitch.gold_multiplier.toFixed(1)}×</p>
                          <p className="text-xs text-yellow-600">multiplier</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-900">
                    Investment Amount
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount (USD)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="text-lg font-semibold h-12 border-2 focus:border-blue-500"
                  />
                  {amount > (pitch?.target_investment_amount! - pitch?.raised_amount!) && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm text-red-700 font-medium">
                        ⚠️ Amount exceeds remaining target (${(pitch?.target_investment_amount! - pitch?.raised_amount!)?.toLocaleString()})
                      </p>
                    </div>
                  )}
                </div>

                {amount > 0 && amount <= (pitch?.target_investment_amount! - pitch?.raised_amount!) && tier && (
                  <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 p-4 border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-900">Your Investment</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${tier === 'Bronze' ? 'bg-amber-100 text-amber-800' :
                        tier === 'Silver' ? 'bg-slate-100 text-slate-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {tier} Tier
                      </span>
                    </div>
                    <p className="text-lg font-bold text-emerald-700">
                      {shares} shares
                    </p>
                    <p className="text-sm text-emerald-600">
                      for ${amount?.toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <Button
                    disabled={!pitch || isPending || amount <= 0 || amount > (pitch.target_investment_amount! - pitch.raised_amount!)}
                    onClick={handleInvest}
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isPending
                      ? "Processing..."
                      : `Invest ${amount > 0 ? `$${amount.toLocaleString()}` : ""}`}
                  </Button>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Payment Method:</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-slate-600">Wallet</span>
                      <Switch
                        checked={withdrawChoice}
                        onCheckedChange={setIsToggled}
                      />
                      <span className="text-sm text-slate-600">Bank</span>
                    </div>
                  </div>
                </div>

                {message && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-700">{message}</p>
                  </div>
                )}

                {versions.length > 1 && (
                  <div className="pt-4 border-t border-slate-200">
                    <label className="text-sm font-semibold text-slate-900 block mb-2">
                      Pitch Version
                    </label>

                    <Select
                      value={pitch?.instance_id || ""}
                      onValueChange={(id) => router.push(`/pitches/${id}`)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select version" />
                      </SelectTrigger>

                      <SelectContent>
                        {[...versions]
                          .sort((a, b) => b.version - a.version)
                          .map((v) => {
                            const isCurrent = v.instance_id === pitch?.instance_id;
                            const createdDate = v.created_at
                              ? new Date(v.created_at)
                              : null;

                            return (
                              <SelectItem
                                key={v.instance_id}
                                value={v.instance_id}
                                className="py-3 px-3"
                              >
                                <div className="flex flex-col w-full text-left">
                                  <span className="font-medium flex items-center gap-2">
                                    v{v.version}
                                    {isCurrent && (
                                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                        Current
                                      </span>
                                    )}
                                  </span>

                                  {createdDate && (
                                    <span className="text-xs text-muted-foreground">
                                      {format(createdDate, "PPP")}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
