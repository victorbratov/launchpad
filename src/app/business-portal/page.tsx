"use client";

import { useEffect, useState } from "react";
import {
  getUserPitches,
  getTotalMoneyInvestedInPitch,
  getTotalInvestorsInPitch,
  getBusinessAccountInfo,
  depositBalance,
  withdrawBalance
} from "./_actions";
import { checkBusinessAuthentication } from "@/lib/globalActions";
import { validateWithdrawalAmount } from "@/lib/utils";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import WithdrawDialog from "@/components/withdrawal_dialog";
import DepositDialog from "@/components/deposit_dialog";
import type { Pitches } from "../../../types/pitch";

interface businessInfo {
  name: string;
  email: string;
  wallet: string;
}

// Extend Pitches with extra fields for enriched data
type FullPitch = Pitches & {
  raised: number;
  investorCount: number;
};

export default function BusinessPortalPage() {
  const [selectedPitch, setSelectedPitch] = useState<FullPitch | null>(null);
  const [busAccountInfo, setBusinessAccountInfo] = useState<businessInfo | null>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);
  const [withdrawing, setWithdrawing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [openDeposit, setOpenDeposit] = useState<boolean>(false);
  const [depositing, setDepositing] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [pitches, setPitches] = useState<FullPitch[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch business info & auth
  useEffect(() => {
    async function loadData() {
      const isBusiness = await checkBusinessAuthentication();
      if (!isBusiness) {
        window.location.href = '/';
        return;
      }
      const busInfo = await getBusinessAccountInfo();
      setBusinessAccountInfo(busInfo);
    }
    loadData();
  }, []);

  // Fetch pitches
  useEffect(() => {
    async function fetchPitches() {
      try {
        const data = await getUserPitches();
        const enriched: FullPitch[] = await Promise.all(
          data.map(async (pitch) => {
            const raised = await getTotalMoneyInvestedInPitch(pitch.BusPitchID);
            const count = await getTotalInvestorsInPitch(pitch.BusPitchID);
            return {
              ...pitch,
              raised: raised?.totalAmount || 0,
              investorCount: count?.investorCount || 0,
            };
          })
        );
        setPitches(enriched);
      } catch (err) {
        console.error("Failed to fetch pitches:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPitches();
  }, []);

  // Withdraw funds
  async function withdrawFunds(amount: number | null) {
    setWithdrawing(true);
    const error = validateWithdrawalAmount(amount, parseFloat(busAccountInfo?.wallet ?? "0"));
    setErrorMessage(error);
    if (!error) {
      try {
        await withdrawBalance(amount ?? parseFloat(busAccountInfo?.wallet ?? "0"));
        setOpen(false);
        const busInfo = await getBusinessAccountInfo();
        setBusinessAccountInfo(busInfo);
      } catch {
        setErrorMessage("Error withdrawing funds. Please try again later.");
      } finally {
        setWithdrawing(false);
      }
    } else {
      setWithdrawing(false);
    }
  }

  // Deposit funds
  async function depositFunds(amount: number | null) {
    setDepositing(true);
    setErrorMessage("");
    try {
      await depositBalance(amount ?? parseFloat(busAccountInfo?.wallet ?? "0"));
      setOpenDeposit(false);
      const busInfo = await getBusinessAccountInfo();
      setBusinessAccountInfo(busInfo);
    } catch {
      setErrorMessage("Error depositing funds. Please try again later.");
    } finally {
      setDepositing(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Business Overview */}
      <Card>
        <CardHeader><CardTitle>Business Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 justify-between flex-wrap items-center">
            <div className="space-y-2">
              <p><strong>Business:</strong> {busAccountInfo?.name ?? "Loading..."}</p>
              <p><strong>Email:</strong> {busAccountInfo?.email ?? "Loading..."}</p>
            </div>
            <div className="sm:text-right space-x-2 space-y-2">
              <p className="pt-2 sm:pt-0"><strong>Wallet Balance:</strong></p>
              <p className="text-2xl font-bold">{busAccountInfo?.wallet ?? "Loading..."}</p>

              {parseFloat(busAccountInfo?.wallet ?? "0") !== 0 && (
                <WithdrawDialog
                  accountInfo={{ wallet: parseFloat(busAccountInfo?.wallet ?? "0") }}
                  fundsFunction={() => withdrawFunds(withdrawalAmount)}
                  open={open}
                  setOpen={setOpen}
                  withdrawing={withdrawing}
                  setWithdrawing={setWithdrawing}
                  withdrawalAmount={withdrawalAmount}
                  setWithdrawalAmount={setWithdrawalAmount}
                  errorMessage={errorMessage ?? ""}
                  setErrorMessage={setErrorMessage}
                />
              )}

              <DepositDialog
                accountInfo={{ wallet: parseFloat(busAccountInfo?.wallet ?? "0") }}
                depositFunds={() => depositFunds(depositAmount)}
                open={openDeposit}
                setOpen={setOpenDeposit}
                depositing={depositing}
                setDepositing={setDepositing}
                depositAmount={depositAmount}
                setDepositAmount={setDepositAmount}
                errorMessage={errorMessage ?? ""}
                setErrorMessage={setErrorMessage}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pitches Section */}
      <Card>
        <CardHeader><CardTitle>Your Pitches</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-lg font-semibold py-10">Loading your pitches...</p>
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
                        <TableCell className="font-medium">{pitch.ProductTitle}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress value={(pitch.raised / Number(pitch.TargetInvAmount || 1)) * 100} />
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

                    {selectedPitch?.BusPitchID === pitch.BusPitchID && (
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>{selectedPitch.ProductTitle}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">{selectedPitch.DetailedPitch}</p>
                          <div>
                            <p><strong>Goal:</strong> ${selectedPitch.TargetInvAmount}</p>
                            <p><strong>Raised:</strong> ${selectedPitch.raised}</p>
                            <p><strong>Investors:</strong> {selectedPitch.investorCount}</p>
                            <p><strong>Profit Share:</strong> {selectedPitch.InvProfShare}%</p>
                            <p><strong>Dividend Period:</strong> {selectedPitch.DividEndPayoutPeriod}</p>
                            <p><strong>Funding End:</strong> {new Date(selectedPitch.InvestmentEnd).toLocaleDateString()}</p>
                          </div>
                        </div>
                                                <DialogFooter className="flex gap-3 justify-end">
                          <Link href={`/business-portal/${pitch.BusPitchID}`}>
                            <Button variant="outline">Edit Pitch</Button>
                          </Link>
                          <Button className="bg-green-600 hover:bg-green-700">
                            Report Profit
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    )}
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

