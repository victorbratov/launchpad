"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { getPitch, createPitchVersion } from "./_actions";
import { fetchAllMedia } from "@/lib/s3_utils";
import Image from "next/image";
import type { BusinessPitch } from "@/db/types";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Star,
  X,
  DollarSign,
  Target,
  TrendingUp,
  Image as ImageIcon,
  Video,
  Save
} from "lucide-react";

/*
 * This page allows a business user to view and edit details of their pitch
 * */
export default function PitchDetailsPage() {
  const { Pitchid: pitchIdParam } = useParams();
  const router = useRouter();
  const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL!;

  const pitchId = String(pitchIdParam);
  const [pitch, setPitch] = useState<BusinessPitch | null>(null);
  const [loading, setLoading] = useState(true);

  const [media, setMediaFiles] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [featured, setFeatured] = useState<string | null>(null);

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
        if (mediaURLs.length > 0) setFeatured(mediaURLs[0]);
      } catch (err) {
        console.error("Error loading pitch:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPitch();
  }, [pitchId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-muted-foreground">Pitch not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const newInstanceId = await createPitchVersion(pitch.pitch_id, {
        product_title: pitchName,
        elevator_pitch: elevatorPitch,
        detailed_pitch: detailedPitch,
        adverts_available: advertMax ? advertMax * 100 : pitch.adverts_available,
      });

      const allowedTypes = ["image/", "video/"];
      const allMedia: (string | File)[] = [
        ...media.filter(Boolean),
        ...pendingFiles,
      ];

      for (const item of allMedia) {
        let file: File;
        let fileName: string;

        if (typeof item === "string") {
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

        const isFeatured =
          item === featured ||
          (typeof item === "string" && item === featured);

        const key = isFeatured
          ? `${pitchId}/featured/${fileName}`
          : `${pitchId}/${fileName}`;

        const uploadUrl = `${BUCKET_URL.replace(/\/$/, "")}/${key}`;

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

  const progressPercentage = (pitch.raised_amount / pitch.target_investment_amount) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Your Pitch</h1>
          <p className="text-slate-600">Update your pitch details, media, and investment information</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">

            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <ImageIcon className="h-6 w-6 text-blue-600" />
                  Supporting Media
                </CardTitle>
                <p className="text-slate-600 mt-2">Upload and manage your pitch media files</p>
              </CardHeader>
              <CardContent className="space-y-6">

                {media.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {media.map((url, idx) => (
                      <div key={idx} className="group relative">
                        <div className={`relative rounded-xl overflow-hidden border-4 transition-all duration-200 ${featured === url
                          ? "border-yellow-400 shadow-lg shadow-yellow-100"
                          : "border-slate-200 hover:border-slate-300"
                          }`}>
                          {url.endsWith(".mp4") ? (
                            <div className="relative">
                              <video src={url} className="w-full h-48 object-cover" controls />
                              <Badge className="absolute top-3 left-3 bg-purple-100 text-purple-700 border-purple-200">
                                <Video className="h-3 w-3 mr-1" />
                                Video
                              </Badge>
                            </div>
                          ) : (
                            <div className="relative">
                              <Image src={url} alt={`Media ${idx}`} width={400} height={200} className="w-full h-48 object-cover" />
                              <Badge className="absolute top-3 left-3 bg-blue-100 text-blue-700 border-blue-200">
                                <ImageIcon className="h-3 w-3 mr-1" />
                                Image
                              </Badge>
                            </div>
                          )}

                          {featured === url && (
                            <Badge className="absolute top-3 right-3 bg-yellow-400 text-yellow-900">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              Featured
                            </Badge>
                          )}
                        </div>

                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant={featured === url ? "secondary" : "outline"}
                            onClick={() => setFeatured(url)}
                            className="w-full"
                          >
                            {featured === url ? (
                              <><Star className="h-4 w-4 mr-2 fill-current" /> Featured</>
                            ) : (
                              <><Star className="h-4 w-4 mr-2" /> Set as Featured</>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pendingFiles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-orange-600" />
                      <h3 className="text-lg font-semibold text-slate-800">Pending Uploads</h3>
                      <Badge variant="secondary">{pendingFiles.length}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingFiles.map((file, idx) => {
                        const fileURL = URL.createObjectURL(file);
                        return (
                          <div key={idx} className="group relative">
                            <div className={`relative rounded-xl overflow-hidden border-4 transition-all duration-200 ${featured === fileURL
                              ? "border-yellow-400 shadow-lg shadow-yellow-100"
                              : "border-orange-200 hover:border-orange-300"
                              }`}>
                              {file.type.startsWith("video/") ? (
                                <div className="relative">
                                  <video src={fileURL} className="w-full h-40 object-cover" controls />
                                  <Badge className="absolute top-2 left-2 bg-purple-100 text-purple-700">
                                    <Video className="h-3 w-3 mr-1" />
                                    Video
                                  </Badge>
                                </div>
                              ) : (
                                <div className="relative">
                                  <Image src={fileURL} alt={`Pending ${idx}`} width={300} height={160} className="w-full h-40 object-cover" />
                                  <Badge className="absolute top-2 left-2 bg-blue-100 text-blue-700">
                                    <ImageIcon className="h-3 w-3 mr-1" />
                                    Image
                                  </Badge>
                                </div>
                              )}

                              <Badge className="absolute top-2 right-2 bg-orange-100 text-orange-700">
                                Pending
                              </Badge>
                            </div>

                            <div className="mt-2 flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => setFeatured(fileURL)}
                                variant={featured === fileURL ? "secondary" : "outline"}
                                className="flex-1"
                              >
                                {featured === fileURL ? (
                                  <><Star className="h-3 w-3 mr-1 fill-current" /> Featured</>
                                ) : (
                                  <><Star className="h-3 w-3 mr-1" /> Set Featured</>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  setPendingFiles((prev) => prev.filter((_, i) => i !== idx))
                                }
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-slate-400 transition-colors">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <label className="cursor-pointer">
                      <span className="text-lg font-medium text-slate-700">Upload Media Files</span>
                      <p className="text-slate-500 mt-1">Choose images or videos to add to your pitch</p>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={(e) => {
                          if (e.target.files) {
                            setPendingFiles([...pendingFiles, ...Array.from(e.target.files)]);
                          }
                        }}
                        className="hidden"
                      />
                      <Button className="mt-4" variant="outline">
                        Choose Files
                      </Button>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl">Pitch Details</CardTitle>
                <p className="text-slate-600">Edit your pitch information</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Pitch Title</Label>
                  <Input
                    value={pitchName}
                    onChange={(e) => setPitchName(e.target.value)}
                    className="text-lg"
                    placeholder="Enter your pitch title"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Elevator Pitch</Label>
                  <Textarea
                    value={elevatorPitch}
                    onChange={(e) => setElevatorPitch(e.target.value)}
                    rows={4}
                    className="resize-none"
                    placeholder="A brief, compelling description of your business..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Detailed Pitch</Label>
                  <Textarea
                    value={detailedPitch}
                    onChange={(e) => setDetailedPitch(e.target.value)}
                    rows={8}
                    className="resize-none"
                    placeholder="Provide a comprehensive explanation of your business, market opportunity, competitive advantage, and growth strategy..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  Advertising Budget
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Used Budget</p>
                    <p className="text-2xl font-bold text-slate-800">
                      ${pitch.total_advert_clicks > 0 ? (pitch.total_advert_clicks / 100) : 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 mb-1">Remaining Budget</p>
                    <p className="text-2xl font-bold text-green-700">
                      ${pitch.adverts_available > 0 ? (pitch.adverts_available / 100) : 0}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Update Maximum Budget (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter maximum advertising budget"
                    value={advertMax ?? ""}
                    onChange={(e) => setAdvertMax(e.target.value === "" ? undefined : Math.round(Number(e.target.value) * 100) / 100)}
                    className="text-lg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-blue-800">
                  <TrendingUp className="h-6 w-6" />
                  Investment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-slate-600">Raised</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">
                      ${pitch.raised_amount.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-slate-600">Target</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">
                      ${pitch.target_investment_amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-slate-600">Profit Share</p>
                    <p className="font-bold text-lg text-slate-800">
                      {pitch.investor_profit_share_percent}%
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-slate-600">Dividend Period</p>
                    <p className="font-bold text-slate-800">
                      {pitch.dividend_payout_period}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSave}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 text-lg shadow-lg"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
