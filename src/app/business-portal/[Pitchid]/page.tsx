"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getPitch, createPitchVersion } from "./_actions";
import { fetchAllMedia } from "@/lib/s3_utils";
import Image from "next/image";
import type { BusinessPitch } from "@/db/types";
import {Label} from "@/components/ui/label";

export default function PitchDetailsPage() {
  const { Pitchid: pitchIdParam } = useParams();
  const router = useRouter();
  const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL!;

  const pitchId = String(pitchIdParam);
  const [pitch, setPitch] = useState<BusinessPitch | null>(null);
  const [loading, setLoading] = useState(true);

  const [media, setMediaFiles] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [featured, setFeatured] = useState<string | null>(null); // <- track featured file

  const [pitchName, setPitchName] = useState("");
  const [elevatorPitch, setElevatorPitch] = useState("");
  const [detailedPitch, setDetailedPitch] = useState("");
  const [advertMax, setAdvertMax] = useState<number | undefined>(undefined);

  useEffect(() => {
    async function loadPitch() {
      if (!pitchId) return;

      try {
        const fetchedPitch = await getPitch(pitchId);
        setPitch(fetchedPitch);
        setPitchName(fetchedPitch.product_title);
        setElevatorPitch(fetchedPitch.elevator_pitch);
        setDetailedPitch(fetchedPitch.detailed_pitch);

        const mediaURLs = await fetchAllMedia(fetchedPitch.pitch_id);
        setMediaFiles(mediaURLs);
        if (mediaURLs.length > 0) setFeatured(mediaURLs[0]); // Default first as featured
      } catch (err) {
        console.error("Error loading pitch:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPitch();
  }, [pitchId]);

  if (loading) return <p>Loading...</p>;
  if (!pitch) return <p>Pitch not found.</p>;

  const handleSave = async () => {
    try {
      // Create a new DB version entry (metadata only)
      const newInstanceId = await createPitchVersion(pitch.pitch_id, {
        product_title: pitchName,
        elevator_pitch: elevatorPitch,
        detailed_pitch: detailedPitch,
        adverts_available: advertMax ?? pitch.adverts_available,
      });

      const allowedTypes = ["image/", "video/"];
      const allMedia: (string | File)[] = [
        ...media.filter(Boolean),
        ...pendingFiles,
      ];

      // Loop over all media and upload each to the right subpath
      for (const item of allMedia) {
        let file: File;
        let fileName: string;

        if (typeof item === "string") {
          // Reupload existing file from its current URL
          try {
            const res = await fetch(item);
            if (!res.ok) {
              console.warn(`Skipping unreachable media: ${item}`);
              continue;
            }
            const blob = await res.blob();
            file = new File([blob], item.split("/").pop() || "media", {
              type: blob.type || "application/octet-stream",
            });
            fileName = file.name;
          } catch (err) {
            console.warn("Unable to re-fetch existing media:", item, err);
            continue;
          }
        } else {
          file = item;
          fileName = file.name;
        }

        if (!allowedTypes.some((t) => file.type.startsWith(t))) {
          console.warn(`Skipping non-media file ${fileName}`);
          continue;
        }

        // Decide upload destination
        const isFeatured =
          item === featured ||
          (typeof item === "string" && item === featured);

        const key = isFeatured
          ? `${newInstanceId}/featured/${fileName}`
          : `${newInstanceId}/${fileName}`;

        const uploadUrl = `${BUCKET_URL.replace(/\/$/, "")}/${key}`;

        // Upload to S3
        const response = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${fileName}: ${response.statusText}`);
        }

        console.log("✅ Uploaded:", uploadUrl);
      }

      alert("New version with featured media saved successfully!");
      router.push("/business-portal");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed, check console for details.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Supporting Media</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Existing media */}
            <div className="flex flex-col gap-4">
              {media.map((url, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`relative border-4 ${featured === url ? "border-yellow-500" : "border-transparent"
                      }`}
                  >
                    {url.endsWith(".mp4") ? (
                      <video src={url} width={400} height={300} controls />
                    ) : (
                      <Image src={url} alt={`Media ${idx}`} width={400} height={300} />
                    )}
                    <div className="flex gap-2 absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant={featured === url ? "secondary" : "default"}
                        onClick={() => setFeatured(url)}
                      >
                        {featured === url ? "⭐ Featured" : "Set Featured"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pending uploads */}
            {pendingFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Pending Uploads</h3>
                <div className="flex flex-wrap gap-3">
                  {pendingFiles.map((file, idx) => {
                    const fileURL = URL.createObjectURL(file);
                    return (
                      <div key={idx} className="relative">
                        {file.type.startsWith("video/") ? (
                          <video src={fileURL} width={200} height={150} controls />
                        ) : (
                          <Image src={fileURL} fill alt={`Pending ${idx}`} width={200} height={150} />
                        )}
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setFeatured(fileURL)}
                            variant={featured === fileURL ? "secondary" : "default"}
                          >
                            {featured === fileURL ? "⭐ Featured" : "Set Featured"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setPendingFiles((prev) => prev.filter((_, i) => i !== idx))
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  setPendingFiles([...pendingFiles, ...Array.from(e.target.files)]);
                }
              }}
              className="mt-4 block w-full file:rounded-md file:border-0 file:py-2 file:px-4
                  file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </CardContent>
        </Card>

        {/* Editable text fields */}
        <div className="space-y-6 mt-6">
          <div>
            <h2 className="text-2xl font-semibold">Title</h2>
            <Input value={pitchName} onChange={(e) => setPitchName(e.target.value)} />
          </div>

          <div>
            <h3 className="text-2xl font-semibold">Elevator Pitch</h3>
            <textarea
              value={elevatorPitch}
              onChange={(e) => setElevatorPitch(e.target.value)}
              rows={3}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <h3 className="text-2xl font-semibold">Detailed Pitch</h3>
            <textarea
              value={detailedPitch}
              onChange={(e) => setDetailedPitch(e.target.value)}
              rows={6}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="space-y-2 border p-4 rounded-md">
            <h3 className="text-2xl font-semibold">Advertising Budget</h3>
            <p>Used: ${pitch.total_advert_clicks / 100}</p>
            <p>Remaining: ${pitch.adverts_available / 100}</p>
            <div className="space-y-2">
              <Label className="mt-4">Update your maximum advertising budget (USD):</Label>
              <Input
                type="number"
                placeholder="Maximum amount to spend on adverts"
                value={advertMax ?? ""}
                onChange={(e) => setAdvertMax(e.target.value === "" ? undefined : Math.round(Number(e.target.value) * 100) / 100)}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Investment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress
              value={(pitch.raised_amount / pitch.target_investment_amount) * 100}
            />
            <p>
              ${pitch.raised_amount.toLocaleString()} raised of $
              {pitch.target_investment_amount.toLocaleString()}
            </p>
            <p>
              <strong>Profit Share:</strong>{" "}
              {pitch.investor_profit_share_percent}%
            </p>
            <p>
              <strong>Dividend Period:</strong>{" "}
              {pitch.dividend_payout_period}
            </p>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full mt-4">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
