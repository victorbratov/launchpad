"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RAGGauge } from "@/components/rag_gauge";
import { createPitch, checkBusinessAuthentication } from "./_actions";
import { useRouter } from "next/navigation";
import { validateDates, validateMaxes, validateMultipliers, setPitchStatus } from "./utils";

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
  const [status, setStatus] = useState<string>("");

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

    // validate dates
    const { success: success, message: message } = validateDates(startDate, endDate)
    if (!success) {
      alert(message)
      return
    }
    setStatus(setPitchStatus(startDate))
    
    // validate tier max and multipliers
    if (!validateMultipliers(bronzeMultiplier, silverMultiplier, goldMultiplier)) {
      alert("Multiplier value must be lowest for bronze and highest for gold")
      return
    }
    if (!validateMaxes(bronzeMax!, silverMax!, parseInt(goal!))) {
      alert("Error with maximum tier values")
      return
    }

    try {
      // non-null assertion, as the input is required by the form so it will always have a value
      await createPitch(title, status, elevatorPitch, detailedPitch, goal!, startDate, endDate, bronzeMultiplier, bronzeMax!, silverMultiplier, silverMax!, goldMultiplier, dividendPeriod);
      router.push("/business-portal"); 
    } catch (err) {
      alert("Error: Unable to create pitch");
      setLoading(false)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pitch Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Create New Pitch</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
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
              {/* Might be done later but leaving for now */}
              {/* Profit Share
            <div className="space-y-2">
              <Label>Profit Share % (Dividends)</Label>
              <Input
                type="number"
                placeholder="10"
                value={profitShare}
                onChange={(e) => setProfitShare(e.target.value)}
                
              />
            </div> */}

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
                <Button disabled={loading} type="submit">{loading ? "Loading..." : "Submit Pitch"} </Button>
              </div>
            </CardContent>
          </form>
        </Card>


        {/* Right: AI Feedback */}
        <Card className="lg:col-span-1">
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
        </Card>
      </div>
    </div>
  );
}
