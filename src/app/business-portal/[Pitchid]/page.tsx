"use client";
      {/* TO TEST CREATE A PITCH WITH ID 1 OR 2 IN DB!!! */}

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MediaCarousel } from "@/components/media_carousel";
import { getPitch, updatePitch } from "../_actions"; // server functions

export default function PitchDetailsPage() {
  const { Pitchid: pitchIdParam } = useParams(); // [pitchId] folder
  console.log("useParams output:", pitchIdParam);

  const pitchId = Number(pitchIdParam);
  console.log("Converted pitchId:", pitchId);

  const [pitch, setPitch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState<string>(""); // investment input

  // Editable fields
  const [pitchName, setPitchName] = useState("");
  const [elevatorPitch, setElevatorPitch] = useState("");
  const [detailedPitch, setDetailedPitch] = useState("");


  useEffect(() => {
    async function fetchPitch() {
      if (!pitchId) return;

      try {
        const data = await getPitch(pitchId);
        console.log("getPitch returned:", data);

        if (data) {
          setPitch(data);
          setPitchName(data.ProductTitle);
          setElevatorPitch(data.ElevatorPitch);
          setDetailedPitch(data.DetailedPitch);
        }
      } catch (err) {
        console.error("Error fetching pitch:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPitch();
  }, [pitchId]);

  if (loading) return <p>Loading...</p>;
  if (!pitch) return <p>Pitch not found</p>;

  const bronzeMax = Number(pitch.bronseInvMax) || 0;
const silverMax = Number(pitch.silverInvMax) || 0;
const goldMax = Number(pitch.goldTierMax) || 0;
  const targetAmount = Number(pitch.TargetInvAmount);
  const currentAmount = pitch.currentAmount || 0; // TODO: calculate from investments table
  const remaining = targetAmount - currentAmount;

  const amount = parseFloat(input) || 0;

  function calculateShares(amount: number) {
    if (amount <= 0) return { tier: null, shares: 0 };
    if (amount <= pitch.bronzeMax) return { tier: "Bronze", shares: amount * pitch.bronseTierMulti };
    if (amount <= pitch.silverTierMax) return { tier: "Silver", shares: amount * pitch.silverTierMulti };
    if (amount <= pitch.goldTierMax) return { tier: "Gold", shares: amount * pitch.goldTierMulti };
    return { tier: null, shares: 0 };
  }

  const { tier, shares } = calculateShares(amount);

  const handleSave = async () => {
    console.log("Saving pitch:", pitchId, { pitchName, elevatorPitch, detailedPitch });
    await updatePitch(pitchId, { ProductTitle: pitchName, ElevatorPitch: elevatorPitch, DetailedPitch: detailedPitch });
    alert("Pitch updated!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      {/* LEFT SIDE */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <MediaCarousel media={pitch.SuportingMedia ? [pitch.SuportingMedia] : []} />
          </div>
        </div>

    <h2 className="text-2xl font-semibold">Title</h2>

          <Input
    value={pitchName}
    onChange={(e) => setPitchName(e.target.value)}
    className="text-3xl font-bold w-full"
    placeholder="Pitch Name"
  />

  {/* Editable elevator pitch */}
      <h3 className="text-2xl font-semibold">Elevator Pitch</h3>
  <textarea
    value={elevatorPitch}
    onChange={(e) => setElevatorPitch(e.target.value)}
    className="w-full text-lg text-muted-foreground p-2 border rounded-md resize-none"
    rows={3}
    placeholder="Elevator Pitch"
  />

  {/* Detailed pitch section */}
  <div className="space-y-2">
    <h2 className="text-2xl font-semibold">Detailed Pitch</h2>
    <textarea
      value={detailedPitch}
      onChange={(e) => setDetailedPitch(e.target.value)}
      className="w-full p-3 border rounded-md resize-none h-72 text-muted-foreground"
      placeholder="Detailed Pitch"
    />
  </div>
<div className="space-y-2">
          <h2 className="text-2xl font-semibold">Investment Terms</h2>
          <p>
            <strong>Profit Share:</strong> {pitch.InvProfShare}% of
            revenue
          </p>
          <p>
            <strong>Dividend Period:</strong> {pitch.DividEndPayoutPeriod}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="lg:col-span-1">
        <div className="sticky top-19 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invest in {pitch.ProductTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={(currentAmount / targetAmount) * 100} />
              <p>${currentAmount.toLocaleString()} raised of ${targetAmount.toLocaleString()} goal</p>
              <p>${remaining.toLocaleString()} remaining</p>

              <div className="space-y-2">
                <h3 className="font-semibold mb-2">Investment Tiers</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                <li><strong>Bronze:</strong> up to ${bronzeMax}, {Number(pitch.bronzeTierMulti) || 1}x shares</li>
                <li><strong>Silver:</strong> ${bronzeMax + 1} - ${silverMax}, {Number(pitch.silverTierMulti) || 1}x shares</li>
                <li><strong>Gold:</strong> ${silverMax + 1} - ${goldMax}, {Number(pitch.goldTierMulti) || 1}x shares</li>
              </ul>

              </div>
              <Button onClick={handleSave} className="w-full mt-2">Save Changes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
