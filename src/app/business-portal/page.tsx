"use client";

import { useEffect, useState } from "react";
import { getUserPitches,getTotalMoneyInvestedInPitch,getTotalInvestorsInPitch } from "./_actions";
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
import Link from "next/link";
import type { Pitches } from "../../../types/pitch";



/**
 * The Business Portal page, allowing users who have Business accounts to view and manage all of their created pitches
 */
const businessInfo = {
  businessID: "biz123",
  ownerName: "John Smith",
  email: "founder@sunDrop.agri",
  walletAmount: 8200,
};

/**
 * Main Business Portal Page Component
 * Shows an overview of the business + all created pitches
 */
export default function BusinessPortalPage() {

  type FullPitch = Pitches & {
  raised: number;
  investorCount: number;
};

const [pitches, setPitches] = useState<FullPitch[]>([]);
const [selectedPitch, setSelectedPitch] = useState<FullPitch | null>(null);
const [loading, setLoading] = useState(true); // add loading state


  useEffect(() => {
  async function fetchPitches() {
    try {
      const data = await getUserPitches();

      const enriched = await Promise.all(
        data.map(async (pitch) => {
          // call your DB helpers
          const raised = await getTotalMoneyInvestedInPitch(pitch.BusPitchID);
          const count = await getTotalInvestorsInPitch(pitch.BusPitchID);

          return {
            ...pitch,
            raised: raised?.totalAmount || 0,   // add raised
            investorCount: count?.investorCount || 0, // add investor count
          };
        })
      );

      setPitches(enriched);
    } catch (error) {
      console.error("Failed to load pitches:", error);
    }finally {
      setLoading(false); // stop loading
    }
  }
  fetchPitches();
}, []);
  return (
    <div className="p-6 space-y-6">
      {/* Business Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Businesss Overview</CardTitle>
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
           {loading ? (
      <p className="text-center text-lg font-semibold py-10">
        Loading your pitches...
      </p>
           ) : (
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
                <Dialog key={pitch.BusPitchID}>
                  <DialogTrigger asChild>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedPitch(pitch)}
                    >
                      <TableCell className="font-medium">
                        {pitch.ProductTitle}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress
  value={(pitch.raised / Number(pitch.TargetInvAmount || 1)) * 100}
/>
                          <span className="text-xs text-muted-foreground">
                            ${pitch.raised} / ${pitch.TargetInvAmount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{pitch.investorCount} investors</TableCell>
                      <TableCell>{pitch.InvProfShare}%</TableCell>
                      <TableCell>{pitch.DividEndPayoutPeriod}</TableCell>
                      <TableCell>{new Date(pitch.InvestmentEnd).toLocaleDateString()}</TableCell>
                    </TableRow>
                  </DialogTrigger>

                  {/* Modal Content */}
                  <DialogContent className="max-w-lg">
                    {selectedPitch && (
                      <>
                        <DialogHeader>
                          <DialogTitle>{selectedPitch.ProductTitle}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            {selectedPitch.DetailedPitch}
                          </p>
                          <div>
                            <p>
                              <strong>Goal:</strong> ${selectedPitch.TargetInvAmount}
                            </p>
                           <p>
                            <strong>Raised:</strong> ${selectedPitch.raised}
                          </p>
                            <p>
                              <strong>Investors:</strong> ${selectedPitch.investorCount}
                            </p>
                            <p>
                              <strong>Profit Share:</strong>{" "}
                              {selectedPitch.InvProfShare}%
                            </p>
                            <p>
                              <strong>Dividend Period:</strong>{" "}
                              {selectedPitch.DividEndPayoutPeriod}
                            </p>
                            <p><strong>Funding End:</strong> {new Date(selectedPitch.InvestmentEnd).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <DialogFooter className="flex gap-3 justify-end">
                           <Link href={`/business-portal/${pitch.BusPitchID}`}>
                          <Button variant="outline">
                            Edit Pitch
                          </Button>
                          </Link>
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
           )}
        </CardContent>
      </Card>
    </div>
  );
}
