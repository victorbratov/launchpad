
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getPitch, updatePitch, deleteMedia} from "./_actions"; 
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
      const data = await getPitch(pitchId);
      if (!data) return;

      setPitch(data);
      setPitchName(data.ProductTitle || "");
      setElevatorPitch(data.ElevatorPitch || "");
      setDetailedPitch(data.DetailedPitch || "");

      const raisedData = await getTotalMoneyInvestedInPitch(pitchId);
      const investorData = await getTotalInvestorsInPitch(pitchId);
      setRaisedAmount(raisedData?.totalAmount || 0);
      setInvestorCount(investorData?.investorCount || 0);

      // Fetch S3 media only
      const s3Media = await fetchAllMedia(String(pitchId));
      console.log("Fetched S3 media keys:", s3Media);

      setMediaFiles(s3Media);

    } catch (err) {
      console.error("Error fetching pitch or media:", err);
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
 * The Delete function to call upon server action to remove an image from the pitch
 * @param fileKey 
 * @returns Deleted pitch
 */
async function fetchAllMedia(pitchID: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BUCKET_URL}?list-type=2&prefix=${pitchID}/`);
  const data = await res.text();

  const parser = new DOMParser();
  const xml = parser.parseFromString(data, "application/xml");
  const items = xml.getElementsByTagName("Key");

  const mediaKeys: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const key = items[i].textContent;
    if (key && !key.endsWith("/")) { // skip folder keys
      mediaKeys.push(`${process.env.NEXT_PUBLIC_BUCKET_URL}${key}`);
    }
  }

  return mediaKeys;
}

const handleDelete = async (fileUrl: string) => {
  if (!confirm(`Are you sure you want to delete ${fileUrl}?`)) return;

  try {
    // Extract S3 key from URL
    const key = fileUrl.replace(process.env.NEXT_PUBLIC_BUCKET_URL!, "");

    // Delete from S3
    await deleteMedia(key);

    // Update local state
    setMediaFiles((prev) => prev.filter((m) => m !== fileUrl));

    alert(`Deleted ${fileUrl}`);
  } catch (err) {
    console.error("Delete failed:", err);
    alert(`Failed to delete ${fileUrl}`);
  }
};









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

      //Merge uploaded keys with existing medi

    }

    alert("Pitch and media updated!");
    router.push("/business-portal"); // <- redirect to business portal
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
  .filter(Boolean)
  .map((item, idx) => {
    const extMatch = item.match(/\.(jpg|jpeg|png|gif|webp|mp4|mov)$/i);
    if (!extMatch) return null;

    return (
      <div key={idx} className="relative">
        {item.toLowerCase().endsWith(".mp4") ? (
          <video src={item} width={400} height={300} controls />
        ) : (
          <Image
            src={item} // <--- use item directly
            alt={`Media ${idx + 1}`}
            width={400}
            height={300}
          />
        )}
        <button
          className="absolute top-2 right-2 bg-red-600 text-white rounded px-4 py-2 text-base font-semibold shadow-lg hover:bg-red-700 transition"
          onClick={() => handleDelete(item)}
        >
          Delete
        </button>
      </div>
    );
  })}

            </div>
                  {/*Do the same but for pending files array */}
                        {pendingFiles.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold mb-2">Pending Images</h3>
                          <div className="flex flex-wrap gap-3">
                            {pendingFiles.map((file, idx) => {
                              const fileURL = URL.createObjectURL(file);
                              const handlePendingDelete = () => {
                                setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
                              };

                              return (
                                <div key={idx} className="relative">
                                  {file.type.startsWith("video/") ? (
                                    <video src={fileURL} width={200} height={150} controls />
                                  ) : (
                                    <Image src={fileURL} alt={`Pending ${idx + 1}`} width={200} height={150} />
                                  )}
                                  <button
                                    className="absolute top-2 right-2 bg-red-600 text-white rounded px-3 py-1 text-sm font-semibold shadow hover:bg-red-700 transition"
                                    onClick={handlePendingDelete} // just removes from pendingFiles
                                  >
                                    Delete
                                  </button>
                                </div>
                              );
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
