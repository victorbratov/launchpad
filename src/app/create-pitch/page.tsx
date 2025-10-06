"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RAGGauge } from "@/components/rag_gauge";

import { Dropzone } from "@mantine/dropzone";
import { Group, Text } from "@mantine/core";
import { ImageIcon, Trash2 } from "lucide-react";
import SortableList, { SortableItem } from "react-easy-sort";
import { arrayMoveImmutable } from "array-move";

import { format } from "date-fns";
import { createPitch, checkBusinessAuthentication } from "./_actions";
import {
  validateDates,
  validateMaxes,
  validateMultipliers,
  setPitchStatus,
} from "./utils";

// Available tags for pitch categorization
const availableTags = [
  "green energy", "water", "sustainability", "education", "AI", "language", "community",
  "food", "fashion", "recycling", "VR", "technology", "transportation", "gaming", "indie", "packaging"
];

export default function CreatePitchPage() {
  const router = useRouter();

  // Core form state
  const [title, setTitle] = useState("");
  const [elevatorPitch, setElevatorPitch] = useState("");
  const [detailedPitch, setDetailedPitch] = useState("");
  const [goal, setGoal] = useState<string>("");
  const [dividendPeriod, setDividendPeriod] = useState("quarterly");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [bronzeMultiplier, setBronzeMultiplier] = useState("");
  const [bronzeMax, setBronzeMax] = useState<number | undefined>();
  const [silverMultiplier, setSilverMultiplier] = useState("");
  const [silverMax, setSilverMax] = useState<number | undefined>();
  const [goldMultiplier, setGoldMultiplier] = useState("");

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState("Pending");

  // Media
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [editing, setEditing] = useState(false);

  // Feedback loader
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [ragScore, setRagScore] = useState<string | null>(null);

  // ensure business authentication
  useEffect(() => {
    checkBusinessAuthentication().then((isBusiness) => {
      if (!isBusiness) {
        alert("You must be logged in with a business account to create a pitch.");
        window.location.href = "/";
      }
    });
  }, []);

  /** Toggle tags */
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  /** Handle AI mock evaluation */
  const handleEvaluate = () => {
    const scores = ["Red", "Amber", "Green"];
    const randomScore = scores[Math.floor(Math.random() * scores.length)];
    setRagScore(randomScore);
    setFeedback(
      "This is a mocked AI evaluation: The pitch has a good problem/solution fit, but could elaborate further on target market sizing and competitor differentiation."
    );
  };

  /** Validate before submitting */
  function validateInput(): boolean {
    const dateCheck = validateDates(startDate, endDate);
    if (!dateCheck.success) {
      alert(dateCheck.message);
      return false;
    }

    setStatus(setPitchStatus(startDate));

    if (!validateMultipliers(bronzeMultiplier, silverMultiplier, goldMultiplier)) {
      alert("Multiplier value must be lowest for bronze and highest for gold.");
      return false;
    }

    const goalNum = parseInt(goal || "0");
    if (!validateMaxes(bronzeMax!, silverMax!, goalNum)) {
      alert("Error with maximum tier values");
      return false;
    }

    return true;
  }

  /** Uploader to S3 */
  const uploadMedia = async (file: File, url: string): Promise<boolean> => {
    const featured = file === mediaFiles[0] ? "featured/" : "";
    const response = await fetch(`${url}/${featured}${file.name}`, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    return response.ok;
  };

  /** Handle form submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput()) return;
    setLoading(true);
    try {
      const { success, message } = await createPitch({
        title,
        status,
        elevatorPitch,
        detailedPitch,
        targetAmount: goal,
        startDate,
        endDate,
        bronzeMultiplier,
        bronzeMax: bronzeMax!,
        silverMultiplier,
        silverMax: silverMax!,
        goldMultiplier,
        dividendPayoutPeriod: dividendPeriod,
        tags: selectedTags,
      });

      if (!success) {
        alert("Failed to create pitch");
        setLoading(false);
        return;
      }

      for (const file of mediaFiles) {
        const ok = await uploadMedia(file, message);
        if (!ok) {
          alert("Error uploading media file.");
          break;
        }
      }

      router.push("/business-portal");
    } catch (err) {
      console.error(err);
      alert("Error: Unable to create pitch");
    } finally {
      setLoading(false);
    }
  };

  /** Drop / sort handlers */
  const handleDrop = (files: File[]) =>
    setMediaFiles((prev) => [...prev, ...files]);
  const deleteItem = (index: number) =>
    setMediaFiles((files) => files.filter((_, i) => i !== index));
  const onSortEnd = (oldIndex: number, newIndex: number) =>
    setMediaFiles((arr) => arrayMoveImmutable(arr, oldIndex, newIndex));

  /** Previews */
  const previews = mediaFiles.map((file, index) => {
    const src = URL.createObjectURL(file);
    return (
      <div key={index} className="w-full max-w-[200px] mx-auto">
        <img src={src} alt={file.name} className="w-full h-auto object-contain" />
        <Label data-testid="media">{index + 1}. {file.name}</Label>
      </div>
    );
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Dialog open={loading}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Creating pitch</DialogTitle>
          </DialogHeader>
          <Text className="text-center">
            Your pitch is being created. Please wait...
          </Text>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pitch Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Create New Pitch</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <Label>Pitch Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              {/* Elevator Pitch */}
              <div>
                <Label>Elevator Pitch</Label>
                <Input
                  value={elevatorPitch}
                  onChange={(e) => setElevatorPitch(e.target.value)}
                  required
                />
              </div>

              {/* Detailed Pitch */}
              <div>
                <Label>Detailed Pitch</Label>
                <Textarea
                  value={detailedPitch}
                  onChange={(e) => setDetailedPitch(e.target.value)}
                  required
                />
              </div>

              {/* Media */}
              <div>
                <Label>Supporting Media</Label>
                <p className="text-neutral-500 text-sm">
                  First image will be used as featured image.
                </p>
                <Dropzone
                  onDrop={handleDrop}
                  maxSize={100 * 1024 ** 2}
                  accept={{ "image/*": [], "video/*": [] }}
                  styles={{
                    root: {
                      borderWidth: 1.5,
                      borderRadius: 7,
                      borderStyle: "solid",
                      padding: "2rem",
                      backgroundColor: "#fff",
                    },
                  }}
                  data-testid="dropzone"
                >
                  <Group justify="center" gap="xl" mih={180} style={{ pointerEvents: "none" }}>
                    <Dropzone.Idle>
                      <div className="text-center space-y-2">
                        <Text size="sm">
                          Drag or click to upload images/videos
                        </Text>
                        <ImageIcon className="mx-auto" size={48} />
                      </div>
                    </Dropzone.Idle>
                  </Group>
                </Dropzone>

                {mediaFiles.length > 0 && (
                  <div className="border mt-4 p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <Text>Media pending upload:</Text>
                      <Button type="button" onClick={() => setEditing(true)}>Edit Media</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4">{previews}</div>
                  </div>
                )}
              </div>

              {/* Editing dialog */}
              <Dialog open={editing} onOpenChange={setEditing}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Edit Media</DialogTitle>
                  </DialogHeader>
                  <CardContent className="space-y-4">
                    <Text>Drag to reorder or delete files</Text>
                    <SortableList onSortEnd={onSortEnd} className="list">
                      {mediaFiles.map((file, idx) => (
                        <SortableItem key={idx}>
                          <div className="flex justify-between items-center gap-2 py-1">
                            <div className="flex-1 border p-3 rounded-md bg-white shadow-sm">
                              {idx + 1}. {file.name}
                            </div>
                            <Button
                              onClick={() => deleteItem(idx)}
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </SortableItem>
                      ))}
                    </SortableList>
                    <Button onClick={() => setEditing(false)}>Done</Button>
                  </CardContent>
                </DialogContent>
              </Dialog>

              {/* Goal */}
              <div>
                <Label>Funding Goal (USD)</Label>
                <Input
                  type="number"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  required
                />
              </div>

              {/* Dividend period */}
              <div>
                <Label>Dividend Period</Label>
                <Select
                  value={dividendPeriod}
                  onValueChange={setDividendPeriod}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dates */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label>Funding Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(startDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(d) => d && setStartDate(d)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1">
                  <Label>Funding End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(endDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(d) => d && setEndDate(d)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Multipliers */}
              <div className="pt-4 font-semibold">Set Tier Multipliers</div>
              <Label>Bronze Max (USD)</Label>
              <Input type="number" value={bronzeMax ?? ""} onChange={(e) => setBronzeMax(+e.target.value)} required />
              <Label>Bronze Multiplier</Label>
              <Input type="number" value={bronzeMultiplier} onChange={(e) => setBronzeMultiplier(e.target.value)} required />
              <Label>Silver Max (USD)</Label>
              <Input type="number" value={silverMax ?? ""} onChange={(e) => setSilverMax(+e.target.value)} required />
              <Label>Silver Multiplier</Label>
              <Input type="number" value={silverMultiplier} onChange={(e) => setSilverMultiplier(e.target.value)} required />
              <Label>Gold Multiplier</Label>
              <Input type="number" value={goldMultiplier} onChange={(e) => setGoldMultiplier(e.target.value)} required />

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-1">
                  {availableTags.map((tag) => (
                    <div key={tag} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => toggleTag(tag)}
                      />
                      <span className="text-sm">{tag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button variant="outline" type="button" onClick={handleEvaluate}>
                  AI Evaluation
                </Button>
                <Button type="submit">Submit Pitch</Button>
              </div>
            </CardContent>
          </form>
        </Card>

        {/* Right panel: AI feedback */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>AI Assistance</CardTitle>
          </CardHeader>
          <CardContent>
            {ragScore ? (
              <div className="space-y-6">
                <RAGGauge ragScore={ragScore as "Red" | "Amber" | "Green"} />
                <div className="p-4 border rounded bg-muted">
                  <p className="font-semibold mb-1">AI Feedback</p>
                  <p className="text-sm text-muted-foreground">{feedback}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Run AI evaluation to get a score and feedback for your pitch.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
