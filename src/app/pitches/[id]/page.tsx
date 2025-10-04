"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MediaCarousel } from "@/components/media_carousel";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useParams } from "next/navigation";
import { Investment, Pitches } from "../../../../types/pitch";
import { getPitchById, investInPitch } from "./_actions";
import { parse } from "path";
import { getTotalMoneyInvestedInPitch } from "./_actions";
import Error from "next/error";


function calculateShares(amount: number, pitch: Pitches) {
  if (amount <= 0) return { tier: null, shares: 0 };
  if (amount <= pitch.bronseInvMax) {
    return { tier: "Bronze", shares: amount * parseInt(pitch.bronseTierMulti) };
  }
  if (amount <= pitch.silverInvMax) {
    return { tier: "Silver", shares: amount * parseInt(pitch.silverTierMulti) };
  }
  if (amount <= pitch.goldTierMax) {
    return { tier: "Gold", shares: amount * parseInt(pitch.goldTierMulti) };
  }
  return { tier: null, shares: 0 };
}

export default function PitchDetailsPage() {



  const params = useParams();
  const pitchID = params.id as string;

  const [busPitchInfo, setBusPitchInfo] = useState<Pitches | null>(null);
  const [investmentInfo, setInvestmentInfo] = useState<Investment | null>(null);


  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleInvest = async () => {
    if (!busPitchInfo) return;
    startTransition(async () => {
      try {
        const result = await investInPitch(parseInt(pitchID), amount);
        setMessage(result.message);
        setInput("");
        window.location.reload();
      } catch (err: any) { // eslint-disable-line no-explicit-any
        setMessage(err.message || "Error investing");
      }
    });
  };

  //where the data is put into the arrays above
  useEffect(() => {
    async function loadData() {
      try {
        const busPitchInfo = await getPitchById(parseInt(pitchID));
        const investmentInfo = await getTotalMoneyInvestedInPitch(parseInt(pitchID));


        setBusPitchInfo(busPitchInfo);
        setInvestmentInfo(investmentInfo);

      } catch (error) {
        console.error("Error fetching pitch data:", error);
      }
    }
    if (pitchID) {
      loadData();
    }
  }, []);

  const [input, setInput] = useState<string>(""); // raw input as string
  const amount = parseFloat(input) || 0;


  const remaining = parseInt((busPitchInfo?.TargetInvAmount || 0).toString()) - (investmentInfo?.totalAmount || 0);

  // Add pitchVersions and selectedVersion state
  const pitchVersions = [
    { id: "v1.0", label: "v1.0", date: "2024-01-01", current: false },
    { id: "v1.1", label: "v1.1", date: "2024-01-15", current: false },
    { id: "v1.2", label: "v1.2", date: "2024-01-20", current: false },
    { id: "v1.3", label: "v1.3", date: "2024-01-25", current: true },
  ];
  const [selectedVersion, setSelectedVersion] = useState<string>(
    pitchVersions.find((v) => v.current)?.id || pitchVersions[0].id
  );

  const { tier, shares } = calculateShares(amount, busPitchInfo!);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <MediaCarousel media={([])} />
          </div>
        </div>

        <h1 className="text-3xl font-bold">{(busPitchInfo?.ProductTitle)}</h1>
        <p className="text-lg text-muted-foreground">{(busPitchInfo?.ElevatorPitch)}</p>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Detiled Pitch</h2>
          <p className="text-muted-foreground">{(busPitchInfo?.DetailedPitch)}</p>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Investment Terms</h2>
          <p>
            <strong>Profit Share:</strong> {busPitchInfo?.InvProfShare}% of
            revenue
          </p>
          <p>
            <strong>Dividend Period:</strong> {busPitchInfo?.DividEndPayoutPeriod}
          </p>
        </div>
      </div>


      {/* investment card where you can invest in company and see tiers and there pricing 

      Progress is the bar that shows how much money has been invested in the company
      CardTitle is well the title
      */}

      {/* RIGHT SIDE - Investment Card */}
      <div className="lg:col-span-1">
        <div className="sticky top-19">
          <Card>
            <CardHeader>
              <CardTitle>Invest in {busPitchInfo?.ProductTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Funding progress */}
              <div className="space-y-2">
                <Progress
                  value={(investmentInfo?.totalAmount || 0) / parseInt((busPitchInfo?.TargetInvAmount || 1).toString()) * 100}
                  className="w-full"
                />
                <p>
                  ${investmentInfo?.totalAmount.toLocaleString()} raised of $
                  {busPitchInfo?.TargetInvAmount.toLocaleString()} goal
                </p>
                <p className="text-sm text-muted-foreground">
                  ${remaining.toLocaleString()} remaining
                </p>
              </div>

              {/* Tiers 
              just the tiers of the company in text
              +1 is needed to so no overlap is allowed 
              
              
              */}
              <div>
                <h3 className="font-semibold mb-2">Investment Tiers</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>
                    <strong>Bronze:</strong> up to ${busPitchInfo?.bronseInvMax},{" "}
                    {busPitchInfo?.bronseTierMulti}x shares
                  </li>
                  <li>
                    <strong>Silver:</strong> ${(busPitchInfo?.silverInvMax || 0) + 1} - $
                    {busPitchInfo?.silverInvMax}, {busPitchInfo?.silverTierMulti}x shares
                  </li>
                  <li>
                    <strong>Gold:</strong> ${(busPitchInfo?.goldTierMax || 0) + 1} - $
                    {busPitchInfo?.goldTierMax}, {busPitchInfo?.goldTierMulti}x shares
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
                disabled={amount <= 0 || amount > remaining || isPending}
                onClick={handleInvest}
                className="w-full"
              >
                {isPending ? "Processing..." : `Invest ${amount > 0 ? `$${amount.toLocaleString()}` : ""}`}
              </Button>

              {message && <p className="text-sm mt-2">{message}</p>}
              {/* Pitch History */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Pitch Version
                </label>
                <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {pitchVersions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {version.label}
                            {version.current && (
                              <span className="ml-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                                Current
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {version.date}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
