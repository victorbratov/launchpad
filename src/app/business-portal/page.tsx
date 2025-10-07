"use client";

import { useEffect, useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { FundsDialog } from "@/components/funds_dialog";
import { PitchDialog } from "@/components/pitch_dialog";
import { BusinessAccount, BusinessPitch } from "@/db/types";
import { depositFunds, getBusinessAccountInfo, getPitches, withdrawFunds } from "./_actions";
import { hasDateBeenReached } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ProfitsDialog } from "@/components/profits_dialog";
import { AdPaymentDialog } from "@/components/ad_payment_dialog";

export default function BusinessPortalPage() {
  const [accountInfo, setAccountInfo] = useState<BusinessAccount | null>(null);
  const [pitches, setPitches] = useState<BusinessPitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionablePitch, setActionablePitch] = useState(false);
  const [adPaymentTime, setAdPaymentTime] = useState<boolean>(false);

  const [selectedPitch, setSelectedPitch] = useState<BusinessPitch | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [profitDialogOpen, setProfitDialogOpen] = useState(false);
  const [adPaymentDialogOpen, setAdPaymentDialogOpen] = useState(false);

  useEffect(() => {
    loadData().then(() => setLoading(false));
  }, []);


  /**
   * Used to load data for the page
   */
  async function loadData() {
    const account_info = await getBusinessAccountInfo();
    const business_pitches = await getPitches();

    setPitches(business_pitches);
    setAccountInfo(account_info);
    setActionablePitch(business_pitches.some((pitch) => hasDateBeenReached(pitch.next_payout_date)));
    setAdPaymentTime(business_pitches.some((pitch) => hasDateBeenReached(pitch.end_date) && pitch.total_advert_clicks > 0));
  }

  /**
   * Handle clicking on a pitch row
   * Opens the pitch details dialog
   * @param pitch The pitch that was clicked on
   */
  function handleRowClick(pitch: BusinessPitch) {
    setSelectedPitch(pitch);
    setDialogOpen(true);
  }

  /**
   * Handle clicking on a pitch row that requires profit reporting
   * Opens the profits dialog
   * @param pitch The pitch that was clicked on
   */
  async function handleProfitRowCLick(pitch: BusinessPitch) {
    setSelectedPitch(pitch);
    setProfitDialogOpen(true);
  }

  async function handleAdRowClick(pitch: BusinessPitch) {
    setSelectedPitch(pitch);
    setAdPaymentDialogOpen(true);
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader><CardTitle>Business Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 justify-between flex-wrap items-center">
            <div className="space-y-2">
              <p><strong>Business:</strong> {accountInfo?.name ?? "Loading..."}</p>
              <p><strong>Email:</strong> {accountInfo?.email ?? "Loading..."}</p>
            </div>
            <div className="sm:text-right space-x-2 space-y-2">
              <p className="pt-2 sm:pt-0"><strong>Wallet Balance:</strong></p>
              <p className="text-2xl font-bold">{accountInfo?.wallet_balance ?? "Loading..."}</p>

              <FundsDialog mode="deposit" balance={accountInfo?.wallet_balance ?? 0} onSubmit={depositFunds} />
              <FundsDialog mode="withdraw" balance={accountInfo?.wallet_balance ?? 0} onSubmit={withdrawFunds} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your Pitches</CardTitle></CardHeader>
        <CardContent>

          {loading ? (
            <p className="text-center text-lg font-semibold py-10">
              Loading your pitches...
            </p>
          ) : (
            <>
              {actionablePitch && (
                <div className="space-y-2 mb-4">
                  <Label className="flex justify-center h-10 border border-2 border-orange-800 bg-orange-200 "><TriangleAlert className="inline mr-2" />You have 1 or more pitches that require profit reporting!<TriangleAlert className="inline ml-2" /></Label>
                </div>
              )}
              {adPaymentTime &&(
                <div className="space-y-2 mb-4">
                  <Label className="flex justify-center h-10 border border-2 border-purple-800 bg-purple-200 "><TriangleAlert className="inline mr-2" />You have 1 or more pitches that require ad payment!<TriangleAlert className="inline ml-2" /></Label>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead>Pitch</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Profit Share</TableHead>
                    <TableHead>Dividend Period</TableHead>
                    <TableHead>Funding End</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pitches.map((pitch) => (

                    <TableRow
                      key={pitch.pitch_id}
                      className={`cursor-pointer ${hasDateBeenReached(pitch.end_date) && pitch.total_advert_clicks > 0 ? "bg-purple-100 hover:bg-purple-200" : hasDateBeenReached(pitch.next_payout_date) ? "bg-orange-100 hover:bg-orange-200": "hover:bg-muted/50"}`}
                      onClick={() => {{hasDateBeenReached(pitch.end_date) && pitch.total_advert_clicks > 0 ? handleAdRowClick(pitch) : hasDateBeenReached(pitch.next_payout_date) ? handleProfitRowCLick(pitch) : handleRowClick(pitch) }}}
                    >
                      <TableCell className="font-medium">{pitch.product_title}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={(pitch.raised_amount / Number(pitch.target_investment_amount || 1)) * 100} />
                          <span className="text-xs text-muted-foreground">
                            ${pitch.raised_amount} / ${pitch.target_investment_amount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{pitch.investor_profit_share_percent}%</TableCell>
                      <TableCell>{pitch.dividend_payout_period}</TableCell>
                      <TableCell>{pitch.end_date.toDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <PitchDialog
        pitch={selectedPitch}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <ProfitsDialog
        pitch={selectedPitch}
        open={profitDialogOpen}
        balance={accountInfo?.wallet_balance ?? 0}
        onOpenChange={setProfitDialogOpen}
        onProfitsDistributed={loadData}
      />
      <AdPaymentDialog
        open={adPaymentDialogOpen}
        onOpenChange={setAdPaymentDialogOpen}
        balance={accountInfo?.wallet_balance ?? 0}
        pitch={selectedPitch}
        onProfitsDistributed={loadData}
      />
    </div>
  );
}
