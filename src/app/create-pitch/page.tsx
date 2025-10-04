"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RAGGauge } from "@/components/rag_gauge";
import { createPitch } from "./_actions";
import { checkBusinessAuthentication } from "@/lib/globalActions";
import { useRouter } from "next/navigation";
import { validateDates, validateMaxes, validateMultipliers, setPitchStatus } from "./utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { Dropzone } from '@mantine/dropzone';
import { Group, Text, SimpleGrid, Box } from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import SortableList, { SortableItem } from 'react-easy-sort'
import arrayMove from 'array-move'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

/**
 * Create pitch page where the user will create their pitch
 * @returns Create pitch page
 */
export default function CreatePitchPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [elevatorPitch, setElevatorPitch] = useState("");
  const [detailedPitch, setDetailedPitch] = useState("");
  const [goal, setGoal] = useState<string>("");
  const [dividendPeriod, setDividendPeriod] = useState("quarterly");
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [bronzeMultiplier, setBronzeMultiplier] = useState<string>("");
  const [bronzeMax, setBronzeMax] = useState<number | undefined>(undefined);
  const [silverMultiplier, setSilverMultiplier] = useState<string>("");
  const [silverMax, setSilverMax] = useState<number>();
  const [goldMultiplier, setGoldMultiplier] = useState<string>("");

  const [feedback, setFeedback] = useState<string | null>(null);
  const [ragScore, setRagScore] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("Pending");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [editing, setEditing] = useState(false);
  const previews = mediaFiles.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return <div key={index} className="w-full max-w-[200px] mx-auto">
      <img
        src={imageUrl}
        alt={`preview-${index}`}
        className="w-full h-auto object-contain"
      />
      <Label data-testid="media" key={index}>{index + 1}. {file.name}</Label>
    </div>
  });

  useEffect(() => {
    // check if the user is logged in with a business account
    checkBusinessAuthentication().then((isBusiness) => {
      if (!isBusiness) {
        alert("You must be logged in with a business account to create a pitch.");
        window.location.href = "/"; // Redirect to home page
      } else {
        console.log("User is authenticated with a business account");
      }
    });
  }, []);


  /**
   * Handle AI evaluation button being clicked
   * curently a mock, just gives a random score
   */
  const handleEvaluate = () => {
    const scores = ["Red", "Amber", "Green"];
    const randomScore = scores[Math.floor(Math.random() * scores.length)];
    setRagScore(randomScore);
    setFeedback(
      "This is a mocked AI evaluation: The pitch has a good problem/solution fit, but could elaborate further on target market sizing and competitor differentiation."
    );
  };

  /**
   * Handle the submission of the pitch
   * @param e event triggered by form submission
   * @returns {void} Return used to exit the function early
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateInput()) {
      setLoading(false);
      return // exit early if invalid input
    }
    try {
      // non-null assertion, as the input is required by the form so it will always have a value
      const { success, message } = await createPitch({ title, status, elevatorPitch, detailedPitch, targetAmount: goal!, startDate, endDate, bronzeMultiplier, bronzeMax: bronzeMax!, silverMultiplier, silverMax: silverMax!, goldMultiplier, dividendPayoutPeriod: dividendPeriod });
      if (success) {
          for (const file of mediaFiles) {
          if (!await uploadMedia(file, message)) {
            alert("Error uploading image");
            return;
          }
        }
        router.push("/business-portal");
      } else {
        setLoading(false);
      }

    } catch (err) {
      alert("Error: Unable to create pitch");
      setLoading(false)
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calls all input validation functions
   * @returns Whether the input is valid or not
   */
  function validateInput() {
    // validate dates
    const { success: success, message: message } = validateDates(startDate, endDate)
    if (!success) {
      alert(message)
      return false
    }
    setStatus(setPitchStatus(startDate))

    // validate tier max and multipliers
    if (!validateMultipliers(bronzeMultiplier, silverMultiplier, goldMultiplier)) {
      alert("Multiplier value must be lowest for bronze and highest for gold")
      return false
    }
    if (!validateMaxes(bronzeMax!, silverMax!, parseInt(goal!))) {
      alert("Error with maximum tier values")
      return false
    }
    return true
  }

  /**
   * Handle files being dropped and stores them
   * @param files files that were dropped
   */
  const handleDrop = (files: File[]) => {
    setMediaFiles((prev) => [...prev, ...files]);
  };

  /**
 * Function to upload an image or video to the S3 bucket
 * @param file File to be uploaded
 * @param url The url to upload the media to
 */
  const uploadMedia = async (file: File, url: string) => {
    // upload file to S3 bucket
    const response = await fetch(`${url}/${ file === mediaFiles[0] ? 'featured/': ""}${file.name}`, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Delete an item from the mediaFiles array
   * @param index Index of the item to be deleted
   */
  function deleteItem(index: number) {
    setMediaFiles((files) => files.filter((_, i) => i !== index));
  }

  /**
   * Sortable list onSortEnd handler
   * Sorts the mediaFiles array when an item is moved
   * Taken from https://www.npmjs.com/package/react-easy-sort/v/0.1.1
   * @param oldIndex Old index of the item
   * @param newIndex New index of the item
   */
  const onSortEnd = (oldIndex: number, newIndex: number) => {
    setMediaFiles((array) => arrayMove(array, oldIndex, newIndex))
  }
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Dialog open={loading}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Creating pitch</DialogTitle>
          </DialogHeader>
          <Text className="text-center">Your pitch is being created. Please wait ....</Text>
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pitch Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Create New Pitch</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit} data-testid="pitch-form">
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label>Pitch Title</Label>
                <Input
                  placeholder="Enter your pitch title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Elevator Pitch */}
              <div className="space-y-2">
                <Label>Elevator Pitch</Label>
                <Input
                  placeholder="One-sentence overview"
                  value={elevatorPitch}
                  onChange={(e) => setElevatorPitch(e.target.value)}
                  required
                />
              </div>

              {/* Detailed Pitch */}
              <div className="space-y-2">
                <Label>Detailed Pitch</Label>
                <Textarea
                  placeholder="Describe your pitch in detail"
                  value={detailedPitch}
                  onChange={(e) => setDetailedPitch(e.target.value)}
                  required
                />
              </div>

              {/* Supporting media */}
              <div className="space-y-2">
                <Label>Supporting Media</Label>
                <p className="text-neutral-500 text-sm">The image labeled 1 will be the feature image, the first image seen when your pitch is viewed. Edit images to re-order.</p>
                <Dropzone
                  onDrop={handleDrop}
                  onReject={(files) => setStatus("failed")}
                  maxSize={100 * 1024 ** 2} // 100mb currently but can be changed
                  accept={{
                    'image/*': [], // All images
                    'video/*': [], // all videos
                  }}
                  styles={{ root: { borderWidth: 1.5, borderRadius: 7, borderStyle: 'solid', padding: '2rem', backgroundColor: "#ffffffff", color: "#6e6e6eff" } }}
                  data-testid="dropzone"
                >
                  <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                    <Dropzone.Idle>
                      <div className="text-center space-y-2" >
                        <Text size="sm" inline>Drag images or videos here or click to select files</Text>
                        <IconPhoto className="mx-auto w-1/2" size={52} color="#6e6e6eff" stroke={1.5} />
                      </div>
                    </Dropzone.Idle>
                    <div>
                    </div>
                  </Group>
                </Dropzone>
                {mediaFiles.length > 0 &&
                  <div className="text-center space-y-2 border-2 p-4" >

                    <div className="flex justify-between items-center">
                      <Text className="pb-2">Media pending upload:</Text>
                      <Button type="button" onClick={() => setEditing(true)}>Edit Media</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      {previews}
                    </div>
                  </div>}
              </div>

              {/* Media editing dialog*/}
              <Dialog open={editing} onOpenChange={setEditing}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Edit Media</DialogTitle>
                  </DialogHeader>
                  <CardContent className="space-y-4">
                    <Text>Drag and drop to re-order media <i className="fa fa-trash" aria-hidden="true"></i></Text>
                    <div>
                      <SortableList onSortEnd={onSortEnd} className="list" draggedItemClassName="dragged">
                        {mediaFiles.map((file, index) => (
                          <SortableItem key={index}>
                            <div className="flex justify-between items-center space-y-1" key={index}>
                              <div className="p-4 w-full bg-white rounded-2xl shadow-sm border border-gray-200 cursor-grab 
                         hover:shadow-md active:cursor-grabbing transition-all duration-200">{index + 1}. {file.name}
                              </div>
                              <Button className="bg-white text-red-600 hover:text-red-800 hover:bg-white focus:bg-white" onClick={() => deleteItem(index)}> <FontAwesomeIcon icon={faTrash} /></Button>
                            </div>
                          </SortableItem>
                        ))}
                      </SortableList>
                    </div>
                    <Button className="mt-4" onClick={() => setEditing(false)}>Done</Button>
                  </CardContent>
                </DialogContent>
              </Dialog>

              {/* Goal */}
              <div className="space-y-2">
                <Label>Funding Goal (USD)</Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={goal}
                  onChange={(e) => setGoal((e.target.value))}
                  required
                />
              </div>

              {/* Dividend Period */}
              <div className="space-y-2">
                <Label>Dividend Period</Label>
                <Select value={dividendPeriod} onValueChange={setDividendPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label>Funding Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => setStartDate(date)}
                      required
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>Funding End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick an end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => setEndDate(date)}
                      required
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Tier Max and Multipliers */}
              <div className="pt-4">Set Tier Multipliers</div>
              <div className="space-y-2">
                <Label>Bronze Tier Maximum (USD)</Label>
                <Input
                  type="number"
                  placeholder="500"
                  value={bronzeMax !== undefined ? bronzeMax.toString() : ""}
                  onChange={(e) => setBronzeMax(parseInt(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Bronze Tier Multiplier</Label>
                <Input
                  type="number"
                  placeholder="1.0"
                  value={bronzeMultiplier}
                  onChange={(e) => setBronzeMultiplier(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Silver Tier Maximum (USD)</Label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={silverMax !== undefined ? silverMax.toString() : ""}
                  onChange={(e) => setSilverMax(parseInt(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Silver Tier Multiplier</Label>
                <Input
                  type="number"
                  placeholder="1.2"
                  value={silverMultiplier}
                  onChange={(e) => setSilverMultiplier(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Gold Tier Maximum (USD)</Label>
                <Input
                  type="number"
                  placeholder={goal}
                  disabled // Gold max is disabled as it is the same as the goal amount
                />
              </div>
              <div className="space-y-2">
                <Label>Gold Tier Multiplier</Label>
                <Input
                  type="number"
                  placeholder="1.0"
                  value={goldMultiplier}
                  onChange={(e) => setGoldMultiplier(e.target.value)}
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleEvaluate}>
                  AI Evaluation
                </Button>
                <Button type="submit">Submit Pitch</Button>
              </div>
            </CardContent>
          </form>
        </Card >

        {/* Right: AI Feedback */}
        < Card className="lg:col-span-1" >
          <CardHeader>
            <CardTitle>AI Assistance</CardTitle>
          </CardHeader>
          <CardContent>
            {ragScore ? (
              <div className="space-y-6">
                {/* New RAG Gauge */}
                <RAGGauge ragScore={ragScore as "Red" | "Amber" | "Green"} />

                {/* Feedback Panel */}
                <div className="p-4 rounded-md border bg-muted">
                  <p className="font-semibold mb-2">AI Feedback</p>
                  <p className="text-sm text-muted-foreground">{feedback}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Run an AI evaluation to receive a score and feedback for your pitch.
              </p>
            )}
          </CardContent>
        </Card >
      </div >
    </div >
  );
}
