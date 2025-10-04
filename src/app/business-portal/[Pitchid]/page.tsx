
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getPitch, updatePitch} from "./_actions"; 
import { fetchMedia } from "./s3Service";
import Image from 'next/image';
import { useUser } from "@clerk/nextjs";
import type { Pitches } from "../../../../types/pitch";
import { useRouter } from "next/navigation";
import {getTotalInvestorsInPitch,getTotalMoneyInvestedInPitch} from "../_actions";




/**
 * Page component for displaying and editing the details of a pitch
 * @returns Edit Pitch Page
 */
export default function PitchDetailsPage() {
  const { Pitchid: pitchIdParam } = useParams();
  const pitchId = Number(pitchIdParam);
  const { user } = useUser();
  const userId = user?.id;
  const router = useRouter();


  const [pitch, setPitch] = useState<Pitches | null>(null);
  const [loading, setLoading] = useState(true);
  const [media, setMediaFiles] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);


  const [pitchName, setPitchName] = useState("");
  const [elevatorPitch, setElevatorPitch] = useState("");
  const [detailedPitch, setDetailedPitch] = useState("");

  const [raisedAmount, setRaisedAmount] = useState(0);
  const [investorCount, setInvestorCount] = useState(0);


  //finds public bucket key- May need to change to private for security
  const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL;


  useEffect(() => {

    async function fetchPitchAndMedia() {
      if (!pitchId) return;

      try {
        //Fetch DB pitch data
        const data = await getPitch(pitchId);
        if (!data) {
          console.warn(`No pitch found for ID ${pitchId}`);
          setLoading(false);
          return;
        }
        console.log("Pitch owner ID:", data.BusAccountID);
        console.log("Current user ID:", userId);
 
      

        //Make variables out of read data
        setPitch(data);

        const raisedData = await getTotalMoneyInvestedInPitch(pitchId);
        const investorData = await getTotalInvestorsInPitch(pitchId);

        setRaisedAmount(raisedData?.totalAmount || 0);
        setInvestorCount(investorData?.investorCount || 0);
        setPitchName(data.ProductTitle || "");
        setElevatorPitch(data.ElevatorPitch || "");
        setDetailedPitch(data.DetailedPitch || "");

        const dbMedia = data.SuportingMedia ? data.SuportingMedia.split(",").filter(Boolean) : [];
        setMediaFiles(dbMedia);

        //Fetch S3 media data
        try {
          const s3Media = await fetchMedia(String(pitchId));
          setMediaFiles(Array.from(new Set([...dbMedia, ...s3Media.filter(Boolean)])));
        } catch (err) {
          console.error("Error fetching S3 media:", err);
        }

      } catch (err) {
        console.error("Error fetching pitch:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPitchAndMedia();
  }, [pitchId]);

  if (loading) return <p>Loading...</p>;
  if (!pitch) return <p>Pitch not found</p>;

  const targetAmount = Number(pitch.TargetInvAmount) || 0;

/**
   * Saves edited pitch fields back into the database.
   *
   * @returns Uploads new field values to database
   */
const handleSave = async () => {
  try {
    await updatePitch(pitchId, {
      ProductTitle: pitchName,
      ElevatorPitch: elevatorPitch,
      DetailedPitch: detailedPitch,
    });

    if (pendingFiles.length > 0) {
      const uploadedKeys: string[] = [];
      const allowedTypes = ["image/", "video/"];

      for (const file of pendingFiles) {
        //Filters non media from upload
        if (!allowedTypes.some(type => file.type.startsWith(type))) {
          alert(`"${file.name}" is not an image or video file! Skipping.`);
          continue;
        }

        const key = `${pitchId}/${file.name}`;
        const response = await fetch(`${BUCKET_URL}${key}`, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!response.ok) throw new Error(`Failed to upload ${file.name}`);
        uploadedKeys.push(key);
      }

      //Merge uploaded keys with existing media
      const newMedia = [...media, ...uploadedKeys];
      await updatePitch(pitchId, { SuportingMedia: newMedia.join(",") });

      setMediaFiles(newMedia);
    }

    alert("Pitch and media updated!");
    router.push("/");
  } catch (err) {
    console.error("Error saving pitch:", err);
    alert("Save failed, check console for details.");
  }
};


return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      <div className="lg:col-span-2 space-y-6">
        {/* media Section */}
        <Card>
          <CardHeader>
            <CardTitle>Supporting Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
              {media
                .filter((item): item is string => !!item && !!BUCKET_URL)
                .map((item, idx) => {
                  // Filters out non-media
                  const extMatch = item.match(/\.(jpg|jpeg|png|gif|webp|mp4|mov)$/i);
                  if (!extMatch) return null;

                  if (item.toLowerCase().endsWith(".mp4")) {
                    return (
                      <video
                        key={idx}
                        src={`${BUCKET_URL}${item}`}
                        width={400}
                        height={300}
                        controls
                      />
                    );
                  } else {
                    return (
                      <Image
                        key={idx}
                        src={`${BUCKET_URL}${item}`}
                        alt={`Media ${idx + 1}`}
                        width={400}
                        height={300}
                      />
                    );
                  }
                })}
            </div>
                  {/*Do the same but for pending files array */}
                  {pendingFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Awaiting Upload:
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {pendingFiles.map((file, idx) => {
                          const fileURL = URL.createObjectURL(file);
                          if (file.type.startsWith("video/")) {
                            return (
                              <video
                                key={idx}
                                src={fileURL}
                                width={200}
                                height={150}
                                controls
                              />
                            );
                          } else {
                            return (
                              <Image
                                key={idx}
                                src={fileURL}
                                alt={`Pending ${idx + 1}`}
                                width={200}
                                height={150}
                              />
                            );
                          }
                        })}
                      </div>
                    </div>
                  )}

                <div>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setPendingFiles([...pendingFiles, ...Array.from(e.target.files)]);
                      }
                    }}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 
                      file:rounded-md file:border-0 file:text-sm file:font-semibold 
                      file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                  </CardContent>
        </Card>

        {/* edit pitch text fields */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Title</h2>
            <Input value={pitchName} onChange={(e) => setPitchName(e.target.value)} className="text-3xl font-bold w-full" placeholder="Pitch Name" />
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-2">Elevator Pitch</h3>
            <textarea value={elevatorPitch} onChange={(e) => setElevatorPitch(e.target.value)} className="w-full text-lg p-2 border rounded-md resize-none" rows={3} placeholder="Elevator Pitch" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">Detailed Pitch</h2>
            <textarea value={detailedPitch} onChange={(e) => setDetailedPitch(e.target.value)} className="w-full p-3 border rounded-md resize-none h-72" placeholder="Detailed Pitch" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Investment Terms</h2>
            <p><strong>Profit Share:</strong> {pitch.InvProfShare}% of revenue</p>
            <p><strong>Dividend Period:</strong> {pitch.DividEndPayoutPeriod}</p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-19 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invest in {pitch.ProductTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <Progress value={(raisedAmount / targetAmount) * 100} />
            <p>${raisedAmount.toLocaleString()} raised of ${targetAmount.toLocaleString()} goal</p>
            <p>${(targetAmount - raisedAmount).toLocaleString()} remaining</p>
            <p><strong>Investors:</strong> {investorCount}</p>
            </CardContent>
          </Card>
          <div className="pt-2">
    <Button onClick={handleSave} className="w-full">
      Save Changes
    </Button>
  </div>
        </div>
      </div>
    </div>
  );
}
