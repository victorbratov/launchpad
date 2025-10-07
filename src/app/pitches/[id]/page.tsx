"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import { MediaCarousel } from "@/components/media_carousel";
import { getPitchByInstanceId, getPitchVersions, getTotalMoneyInvestedInPitch, investInPitch } from "./_actions";
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
  const [investmentSummary, setInvestmentSummary] = useState<{ pitch_id: string; totalAmount: number } | null>(null);

  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [WithdrawChoice, setIsToggled] = useState(false);

  const [media, setMedia] = useState<string[]>([]);
  const amount = parseFloat(input) || 0;

  const router = useRouter();

  // Load pitch + versions + investments
  useEffect(() => {
    async function load() {
      try {
        const pitchData = await getPitchByInstanceId(instanceId);
        if (!pitchData) {
          setMessage("Pitch not found.");
          return;
        }

        const versions = await getPitchVersions(pitchData.pitch_id);
        const total = await getTotalMoneyInvestedInPitch(pitchData.pitch_id);

        setPitch(pitchData);
        setVersions(versions);
        setInvestmentSummary(total);
        fetchAllMedia(pitchData.instance_id).then((m) => setMedia(m));
      } catch (err) {
        console.error(err);
        setMessage("Error loading pitch data.");
      }
    }
    if (instanceId) load();
  }, [instanceId]);

  const remaining =
    pitch && investmentSummary
      ? pitch.target_investment_amount - investmentSummary.totalAmount
      : 0;

  const { tier, shares } = calculateShares(amount, pitch);

  /** Invest Handler */
  const handleInvest = async () => {
    if (!pitch) return;
    startTransition(async () => {
      try {
        const res = await investInPitch(pitch.instance_id, amount, WithdrawChoice); // invest by instance_id
        setMessage(res.message);
      } catch (err: any) {
        console.error(err);
        setMessage(err.message || "Error investing.");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      <div className="lg:col-span-2 space-y-6">
        {media.length > 0 && (
          <div className="flex justify-center">
            <div className="w-full max-w-3xl">
              <MediaCarousel media={media} />
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold">{pitch?.product_title}</h1>
        <p className="text-lg text-muted-foreground">{pitch?.elevator_pitch}</p>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Detailed Pitch</h2>
          <p className="text-muted-foreground whitespace-pre-line">
            {pitch?.detailed_pitch}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Investment Terms</h2>
          <p>
            <strong>Profit Share:</strong>{" "}
            {pitch?.investor_profit_share_percent.toFixed(2)}% of revenue
          </p>
          <p>
            <strong>Dividend Period:</strong> {pitch?.dividend_payout_period}
          </p>
          <p>
            <strong>Funding Window:</strong>{" "}
            {pitch?.start_date!.toDateString()} –{" "}
            {pitch?.end_date!.toDateString()}
          </p>
        </div>
      </div>

      {/* RIGHT: Investment Panel */}
      <div className="lg:col-span-1">
        <div className="sticky top-20">
          <Card>
            <CardHeader>
              <CardTitle>
                Invest in: {pitch ? pitch.product_title : "Pitch"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress */}
              <div>
                <Progress
                  value={
                    pitch && investmentSummary
                      ? (investmentSummary.totalAmount / pitch.target_investment_amount) * 100
                      : 0
                  }
                />
                <p>
                  ${investmentSummary?.totalAmount.toLocaleString() ?? 0} raised of $
                  {pitch?.target_investment_amount.toLocaleString() ?? 0} goal
                </p>
                <p className="text-sm text-muted-foreground">
                  ${remaining.toLocaleString()} remaining
                </p>
              </div>

              {/* Tiers */}
              {pitch && (
                <div>
                  <h3 className="font-semibold mb-2">Investment Tiers</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      <strong>Bronze</strong>: up to ${pitch.silver_threshold},{" "}
                      {pitch.bronze_multiplier.toFixed(2)}× shares
                    </li>
                    <li>
                      <strong>Silver</strong>: ${pitch.silver_threshold + 1} – $
                      {pitch.gold_threshold}, {pitch.silver_multiplier.toFixed(2)}× shares
                    </li>
                    <li>
                      <strong>Gold</strong>: over ${pitch.gold_threshold},{" "}
                      {pitch.gold_multiplier.toFixed(2)}× shares
                    </li>
                  </ul>
                </div>
              )}

              {/* Input */}
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Enter amount (USD)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                {amount > remaining && (
                  <p className="text-sm text-destructive">
                    You cannot invest more than ${remaining.toLocaleString()}.
                  </p>
                )}
              </div>

              {/* Tier Display */}
              {amount > 0 && amount <= remaining && tier && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  <p>
                    Tier: <strong>{tier}</strong>
                  </p>
                  <p>
                    You’ll receive <strong>{shares}</strong> shares
                  </p>
                </div>
              )}

              <div className = "flex items-center space-x-2"> 
                {/* Invest Button */}
                <div className = "flex-grow">
                  <Button
                    disabled={!pitch || isPending || amount <= 0 || amount > remaining}
                    onClick={handleInvest}
                    className="w-full"
                  >
                    {isPending
                      ? "Processing..."
                      : `Invest ${amount > 0 ? `$${amount.toLocaleString()}` : ""}`}
                  </Button>
                </div>

                <div>Wallet</div>

                <div>
                  <Switch 
                    checked={WithdrawChoice}
                    onCheckedChange={setIsToggled}
                  />
                </div>

                <div>Bank</div>

              </div>

              {message && <p className="text-sm mt-2">{message}</p>}

              {versions.length > 1 && (
                <div className="pt-4">
                  <label className="text-sm font-medium text-muted-foreground">
                    Pitch Version
                  </label>

                  <Select
                    value={pitch?.instance_id || ""}
                    onValueChange={(id) => router.push(`/pitches/${id}`)}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>

                    <SelectContent>
                      {[...versions] // Sort newest to oldest
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
                              className="py-2 px-3 hover:bg-secondary/10 cursor-pointer"
                            >
                              <div className="flex flex-col w-full text-left">
                                <span className="font-medium flex items-center gap-2">
                                  v{v.version}
                                  {isCurrent && (
                                    <span className="text-xs bg-primary text-primary-foreground px-1.5 rounded">
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
  );
}
