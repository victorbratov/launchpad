"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MediaCarousel } from "@/components/media_carousel";

const mockPitch = {
  pitchID: "p1",
  pitcherID: "user1",
  pitchName: "SunDrop: Affordable Solar-Powered Irrigation Systems",
  pitchStatus: "Active",
  pitchGoal: 10000,
  currentAmount: 4200,
  pitchStart: "2024-01-01",
  pitchEnd: "2024-03-01",
  elevatorPitch:
    "SunDrop provides low-cost solar-powered irrigation systems designed for smallholder farmers in rural communities, helping them increase crop yields, reduce costs, and achieve year-round farming independence.",
  detailedPitch: `
Millions of smallholder farmers across Africa and South Asia lack reliable and affordable access to irrigation. Diesel water pumps are expensive to operate, harmful to the environment, and often inaccessible in off-grid regions. As a result, farmers are forced to depend solely on rainfall, leaving them vulnerable to droughts and seasonal food insecurity.

SunDrop’s solar-powered irrigation system offers a sustainable and cost-effective alternative. Our pumps are designed to be affordable, durable, and easy to maintain, enabling farmers to irrigate their crops consistently without relying on fossil fuels. By harnessing the power of the sun, SunDrop drastically reduces agricultural costs and provides farmers with a tool to increase crop yields by up to 40%.

We’ve already piloted our first units with 25 farmers in rural Kenya, receiving overwhelmingly positive feedback. Farmers using SunDrop pumps not only reduced their energy costs but also extended their growing seasons, giving them additional harvest cycles annually. Early impact data suggests an average 35% increase in household income.

This funding campaign will allow us to manufacture and distribute our next batch of 100 pumps while expanding our reach into neighboring regions. Investors will directly support local food security, rural economic empowerment, and climate-friendly agricultural practices.

By funding SunDrop, you invest not only in a growing market—projected to reach over $2.5B globally by 2027—but also in a movement towards sustainable farming and climate resilience.`,
  profitSharePercentage: 10,
  dividendPeriod: "quarterly",
  media: [
    "https://placehold.co/800x400?text=Farmers+Using+SunDrop",
    "https://placehold.co/800x400?text=Pump+Prototype",
    "https://samplelib.com/lib/preview/mp4/sample-5s.mp4", // Pitch video
  ],
  bronzeTierMult: 1,
  silverTierMult: 1.2,
  goldTierMult: 1.5,
  bronzeMax: 999,
  silverMax: 4999,
  goldMax: 10000,
};

function calculateShares(amount: number, pitch: typeof mockPitch) {
  if (amount <= 0) return { tier: null, shares: 0 };
  if (amount <= pitch.bronzeMax) {
    return { tier: "Bronze", shares: amount * pitch.bronzeTierMult };
  }
  if (amount <= pitch.silverMax) {
    return { tier: "Silver", shares: amount * pitch.silverTierMult };
  }
  if (amount <= pitch.goldMax) {
    return { tier: "Gold", shares: amount * pitch.goldTierMult };
  }
  return { tier: null, shares: 0 };
}

export default function PitchDetailsPage() {
  const pitch = mockPitch;
  const [input, setInput] = useState<string>(""); // raw input as string
  const amount = parseFloat(input) || 0;
  const remaining = pitch.pitchGoal - pitch.currentAmount;

  const { tier, shares } = calculateShares(amount, pitch);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <MediaCarousel media={pitch.media} />
          </div>
        </div>

        <h1 className="text-3xl font-bold">{pitch.pitchName}</h1>
        <p className="text-lg text-muted-foreground">{pitch.elevatorPitch}</p>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Detiled Pitch</h2>
          <p className="text-muted-foreground">{pitch.detailedPitch}</p>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Investment Terms</h2>
          <p>
            <strong>Profit Share:</strong> {pitch.profitSharePercentage}% of
            revenue
          </p>
          <p>
            <strong>Dividend Period:</strong> {pitch.dividendPeriod}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Investment Card */}
      <div className="lg:col-span-1">
        <div className="sticky top-19">
          <Card>
            <CardHeader>
              <CardTitle>Invest in {pitch.pitchName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Funding progress */}
              <div className="space-y-2">
                <Progress
                  value={(pitch.currentAmount / pitch.pitchGoal) * 100}
                  className="w-full"
                />
                <p>
                  ${pitch.currentAmount.toLocaleString()} raised of $
                  {pitch.pitchGoal.toLocaleString()} goal
                </p>
                <p className="text-sm text-muted-foreground">
                  ${remaining.toLocaleString()} remaining
                </p>
              </div>

              {/* Tiers */}
              <div>
                <h3 className="font-semibold mb-2">Investment Tiers</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>
                    <strong>Bronze:</strong> up to ${pitch.bronzeMax},{" "}
                    {pitch.bronzeTierMult}x shares
                  </li>
                  <li>
                    <strong>Silver:</strong> ${pitch.bronzeMax + 1} - $
                    {pitch.silverMax}, {pitch.silverTierMult}x shares
                  </li>
                  <li>
                    <strong>Gold:</strong> ${pitch.silverMax + 1} - $
                    {pitch.goldMax}, {pitch.goldTierMult}x shares
                  </li>
                </ul>
              </div>

              {/* Investment input (text, user-friendly) */}
              <div className="space-y-3">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter amount (USD)"
                  value={input}
                  onChange={(e) => {
                    // Only allow digits
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setInput(val);
                  }}
                />
                {amount > remaining && (
                  <p className="text-sm text-red-600">
                    You cannot invest more than ${remaining.toLocaleString()}.
                  </p>
                )}
              </div>

              {/* Calculator output */}
              {amount > 0 && amount <= remaining ? (
                <div className="p-3 rounded-md bg-muted text-sm">
                  <p>
                    Tier: <strong>{tier}</strong>
                  </p>
                  <p>
                    You will receive <strong>{shares}</strong> shares
                  </p>
                </div>
              ) : null}

              {/* Invest button */}
              <Button
                disabled={amount <= 0 || amount > remaining}
                className="w-full"
              >
                Invest {amount > 0 ? `$${amount.toLocaleString()}` : ""}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
