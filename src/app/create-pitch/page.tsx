"use client";

import { useState } from "react";
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

export default function CreatePitchPage() {
  const [name, setName] = useState("");
  const [elevatorPitch, setElevatorPitch] = useState("");
  const [detailedPitch, setDetailedPitch] = useState("");
  const [goal, setGoal] = useState("");
  const [profitShare, setProfitShare] = useState("");
  const [dividendPeriod, setDividendPeriod] = useState("quarterly");
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [ragScore, setRagScore] = useState<string | null>(null);

  const handleEvaluate = () => {
    const scores = ["Red", "Amber", "Green"];
    const randomScore = scores[Math.floor(Math.random() * scores.length)];
    setRagScore(randomScore);
    setFeedback(
      "This is a mocked AI evaluation: The pitch has a good problem/solution fit, but could elaborate further on target market sizing and competitor differentiation."
    );
  };

  const handleSubmit = () => {
    console.log({
      name,
      elevatorPitch,
      detailedPitch,
      goal,
      profitShare,
      dividendPeriod,
      endDate,
    });
    alert("Pitch submitted successfully (mock)!");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pitch Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Create New Pitch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label>Pitch Name</Label>
              <Input
                placeholder="Enter your pitch name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Elevator Pitch */}
            <div className="space-y-2">
              <Label>Elevator Pitch</Label>
              <Input
                placeholder="One-sentence overview"
                value={elevatorPitch}
                onChange={(e) => setElevatorPitch(e.target.value)}
              />
            </div>

            {/* Detailed Pitch */}
            <div className="space-y-2">
              <Label>Detailed Pitch</Label>
              <Textarea
                placeholder="Describe your pitch in detail"
                value={detailedPitch}
                onChange={(e) => setDetailedPitch(e.target.value)}
              />
            </div>

            {/* Goal */}
            <div className="space-y-2">
              <Label>Funding Goal (USD)</Label>
              <Input
                type="number"
                placeholder="10000"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>

            {/* Profit Share */}
            <div className="space-y-2">
              <Label>Profit Share % (Dividends)</Label>
              <Input
                type="number"
                placeholder="10"
                value={profitShare}
                onChange={(e) => setProfitShare(e.target.value)}
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
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleEvaluate}>
                AI Evaluation
              </Button>
              <Button onClick={handleSubmit}>Submit Pitch</Button>
            </div>
          </CardContent>
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
