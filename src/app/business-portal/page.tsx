"use client";

import { useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Mock Data
const businessInfo = {
  businessID: "biz123",
  ownerName: "John Smith",
  email: "founder@sunDrop.agri",
  walletAmount: 8200,
};

const pitches = [
  {
    pitchID: "p1",
    pitchName: "SunDrop: Solar Irrigation",
    pitchGoal: 10000,
    currentAmount: 7400,
    investors: 23,
    profitSharePercentage: 10,
    dividendPeriod: "Quarterly",
    pitchEnd: "2024-08-01",
    detailedPitch:
      "Our project empowers farmers in rural Kenya with affordable solar-powered irrigation systems to increase yields and fight climate vulnerability.",
  },
  {
    pitchID: "p2",
    pitchName: "EcoThreads: Recycled Fashion",
    pitchGoal: 15000,
    currentAmount: 15000,
    investors: 40,
    profitSharePercentage: 8,
    dividendPeriod: "Yearly",
    pitchEnd: "2024-07-15",
    detailedPitch:
      "EcoThreads creates sustainable fashion items entirely from recycled plastics and organic cotton, focusing on reducing fast fashion’s footprint.",
  },
];

interface Pitch {
  pitchID: string;
  pitchName: string;
  pitchGoal: number;
  currentAmount: number;
  investors: number;
  profitSharePercentage: number;
  dividendPeriod: string;
  pitchEnd: string;
  detailedPitch: string;
}

export default function BusinessPortalPage() {
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);

  return (
    <div className="p-6 space-y-6">
      {/* Business Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Business Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between flex-wrap">
            <div>
              <p><strong>Owner:</strong> {businessInfo.ownerName}</p>
              <p><strong>Email:</strong> {businessInfo.email}</p>
            </div>
            <div className="text-right">
              <p><strong>Wallet Balance:</strong></p>
              <p className="text-2xl font-bold">${businessInfo.walletAmount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pitches Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Pitches</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pitch</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Investors</TableHead>
                <TableHead>Profit Share</TableHead>
                <TableHead>Dividend Period</TableHead>
                <TableHead>Funding End</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pitches.map((pitch) => (
                <Dialog key={pitch.pitchID}>
                  <DialogTrigger asChild>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedPitch(pitch)}
                    >
                      <TableCell className="font-medium">
                        {pitch.pitchName}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress
                            value={(pitch.currentAmount / pitch.pitchGoal) * 100}
                          />
                          <span className="text-xs text-muted-foreground">
                            ${pitch.currentAmount} / ${pitch.pitchGoal}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{pitch.investors}</TableCell>
                      <TableCell>{pitch.profitSharePercentage}%</TableCell>
                      <TableCell>{pitch.dividendPeriod}</TableCell>
                      <TableCell>{pitch.pitchEnd}</TableCell>
                    </TableRow>
                  </DialogTrigger>

                  {/* Modal Content */}
                  <DialogContent className="max-w-lg">
                    {selectedPitch && (
                      <>
                        <DialogHeader>
                          <DialogTitle>{selectedPitch.pitchName}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            {selectedPitch.detailedPitch}
                          </p>
                          <div>
                            <p><strong>Goal:</strong> ${selectedPitch.pitchGoal}</p>
                            <p>
                              <strong>Raised:</strong> ${selectedPitch.currentAmount}
                            </p>
                            <p><strong>Investors:</strong> {selectedPitch.investors}</p>
                            <p>
                              <strong>Profit Share:</strong>{" "}
                              {selectedPitch.profitSharePercentage}%
                            </p>
                            <p>
                              <strong>Dividend Period:</strong>{" "}
                              {selectedPitch.dividendPeriod}
                            </p>
                            <p><strong>Funding End:</strong> {selectedPitch.pitchEnd}</p>
                          </div>
                        </div>
                        <DialogFooter className="flex gap-3 justify-end">
                          <Button variant="outline">
                            Edit Pitch
                          </Button>
                          <Button className="bg-green-600 hover:bg-green-700">
                            Report Profit
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
