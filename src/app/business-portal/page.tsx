"use client";

import { useEffect, useState } from "react";
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
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { get } from "http";
import { getBusinessAccountInfo, depositBalance, withdrawBalance } from "./_actions";
import { checkBusinessAuthentication } from "@/lib/globalActions";
import { Input } from "@/components/ui/input";
import WithdrawDialog from "@/components/withdrawal_dialog";
import DepositDialog from "@/components/deposit_dialog";
import { validateWithdrawalAmount } from "@/lib/utils";

/**
 * Basic business account information
 */
interface businessInfo {
  name: string; /** The name of the business owner */
  email: string; /** The email of the business */
  wallet: string; /** The amount of money in the business account wallet */
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

/**
 * Business Portal Page, showing an overview of the business account and their pitches
 * @returns The business portal page
 */
export default function BusinessPortalPage() {
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);
  const [busAccountInfo, setBusinessAccountInfo] = useState<businessInfo | null>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);
  const [withdrawing, setWithdrawing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [openDeposit, setOpenDeposit] = useState<boolean>(false);
  const [depositing, setDepositing] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);

  useEffect(() => {
    // fetch business account info
    async function loadData() {
      try {
        const busInfo: businessInfo = await getBusinessAccountInfo();
        setBusinessAccountInfo(busInfo);
      } catch (error) {

      }
    }
    // check authentication, and if authenticated, load business data
    checkBusinessAuthentication().then((isBusiness) => {
      if (!isBusiness) {
        window.location.href = '/';
      } else {
        loadData();
      }
    });
  }, []);

  /**
   * Handle the withdrawal of funds from the business account
   * @param amount The amount to withdraw
   */
  async function withdrawFunds(amount: number | null) {
    setWithdrawing(true);

    setErrorMessage(validateWithdrawalAmount(amount, parseFloat(busAccountInfo?.wallet ?? "0")));
    if (errorMessage === null) {
      try {
        await withdrawBalance(amount ?? parseFloat(busAccountInfo?.wallet ?? "0"));
        setOpen(false);
        // get updated info
        const busInfo: businessInfo = await getBusinessAccountInfo();
        setBusinessAccountInfo(busInfo);
      } catch (error) {
        setErrorMessage("Error withdrawing funds. Please try again later.");
        setWithdrawing(false);
      }
    } else {
      setWithdrawing(false);
    }
  }

  /**
   * Deposit funds into the business account from the linked bank account
   * @param amount The amount to deposit
   */
  async function depositFunds(amount: number | null) {
    setErrorMessage("");
    setDepositing(true);

    try {
      await depositBalance(amount ?? parseFloat(busAccountInfo?.wallet ?? "0"));
      setOpenDeposit(false);
      const busInfo: businessInfo = await getBusinessAccountInfo();
      setBusinessAccountInfo(busInfo);
    } catch (error) {
      setErrorMessage("Error withdrawing funds. Please try again later.");
      setDepositing(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Business Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Business Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 justify-between flex-wrap items-center">
            <div className="space-y-2">
              <p><strong>Business:</strong> {busAccountInfo ? busAccountInfo.name : "Loading.."}</p>
              <p><strong>Email:</strong> {busAccountInfo ? busAccountInfo.email : "Loading..."}</p>
            </div>
            <div className="sm:text-right space-x-2 space-y-2">
              <p className="pt-2 sm:pt-0"><strong>Wallet Balance:</strong></p>
              <p className="text-2xl font-bold">{busAccountInfo ? busAccountInfo.wallet : "Loading..."}</p>

              {/* Withdraw button */}
              {/** Only show withdraw option if there is money in the account */}
              {parseFloat(busAccountInfo?.wallet ?? "") != 0 &&
                <WithdrawDialog
                  accountInfo={busAccountInfo ? { wallet: parseFloat(busAccountInfo.wallet) } : { wallet: 0 }}
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
              }

              {/* Deposit button */}
              <DepositDialog
                accountInfo={busAccountInfo ? { wallet: parseFloat(busAccountInfo.wallet) } : { wallet: 0 }}
                depositFunds={() => depositFunds(depositAmount)}
                open={open}
                setOpen={setOpen}
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
    </div >
  );
}
