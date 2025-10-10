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
import { TriangleAlert, Building2, Mail, Wallet, Plus, TrendingUp, Calendar, Target } from "lucide-react";
import { ProfitsDialog } from "@/components/profits_dialog";
import { AdPaymentDialog } from "@/components/ad_payment_dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

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

  const router = useRouter();

  useEffect(() => {
    loadData().then(() => setLoading(false));
  }, []);

  async function loadData() {
    const account_info = await getBusinessAccountInfo();
    const business_pitches = await getPitches();

    setPitches(business_pitches);
    setAccountInfo(account_info);
    setActionablePitch(business_pitches.some((pitch) => hasDateBeenReached(pitch.next_payout_date)));
    setAdPaymentTime(business_pitches.some((pitch) => hasDateBeenReached(pitch.end_date) && pitch.total_advert_clicks > 0));
  }

  function handleRowClick(pitch: BusinessPitch) {
    setSelectedPitch(pitch);
    setDialogOpen(true);
  }

  async function handleProfitRowCLick(pitch: BusinessPitch) {
    setSelectedPitch(pitch);
    setProfitDialogOpen(true);
  }

  async function handleAdRowClick(pitch: BusinessPitch) {
    setSelectedPitch(pitch);
    setAdPaymentDialogOpen(true);
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const getPitchStatusBadge = (pitch: BusinessPitch) => {
    if (hasDateBeenReached(pitch.end_date) && pitch.total_advert_clicks > 0) {
      return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Ad Payment Due</Badge>;
    }
    if (hasDateBeenReached(pitch.next_payout_date)) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Profit Report Due</Badge>;
    }
    const progress = (pitch.raised_amount / Number(pitch.target_investment_amount || 1)) * 100;
    if (progress >= 100) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Funded</Badge>;
    }
    if (hasDateBeenReached(pitch.end_date)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="outline">Active</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Portal</h1>
          <p className="text-gray-600">Manage your pitches and track your funding progress</p>
        </div>

        {/* Alerts Section */}
        {(actionablePitch || adPaymentTime) && (
          <div className="space-y-4">
            {actionablePitch && (
              <Card className="border-l-4 border-l-orange-500 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TriangleAlert className="w-5 h-5 text-orange-600" />
                    <p className="text-orange-800 font-medium">
                      You have 1 or more pitches that require profit reporting!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {adPaymentTime && (
              <Card className="border-l-4 border-l-purple-500 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TriangleAlert className="w-5 h-5 text-purple-600" />
                    <p className="text-purple-800 font-medium">
                      You have 1 or more pitches that require ad payment!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Business Overview Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-[#677DB7]" />
              <span className="text-2xl font-bold text-gray-900">Business Overview</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Business Info */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Business</p>
                      <p className="text-lg font-semibold text-gray-900">{accountInfo?.name ?? "Loading..."}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Email</p>
                      <p className="text-lg font-semibold text-gray-900">{accountInfo?.email ?? "Loading..."}</p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full sm:w-auto bg-[#677DB7] hover:bg-[#677DB7]/90 shadow-lg"
                  onClick={() => router.push("/create-pitch")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Pitch
                </Button>
              </div>

              {/* Wallet Section */}
              <div className="lg:text-right">
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 lg:justify-end mb-4">
                      <Wallet className="w-6 h-6 text-[#677DB7]" />
                      <p className="font-semibold text-gray-700">Wallet Balance</p>
                    </div>

                    <p className="text-3xl font-bold text-gray-900 mb-6">
                      {accountInfo?.wallet_balance ? formatCurrency(accountInfo.wallet_balance) : "Loading..."}
                    </p>

                    <div className="flex flex-wrap gap-3 lg:justify-end">
                      <FundsDialog
                        mode="deposit"
                        balance={accountInfo?.wallet_balance ?? 0}
                        onSubmit={depositFunds}
                      />
                      <FundsDialog
                        mode="withdraw"
                        balance={accountInfo?.wallet_balance ?? 0}
                        onSubmit={withdrawFunds}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pitches Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-white rounded-t-lg border-b">
            <CardTitle className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-[#677DB7]" />
              <span className="text-[#677DB7] text-2xl font-bold">Your Pitches</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#677DB7] mx-auto"></div>
                  <p className="text-lg font-semibold text-gray-600">Loading your pitches...</p>
                </div>
              </div>
            ) : pitches.length === 0 ? (
              <div className="text-center py-20">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pitches yet</h3>
                <p className="text-gray-600 mb-6">Create your first pitch to start raising funds</p>
                <Button
                  onClick={() => router.push("/create-pitch")}
                  className="bg-[#677DB7] hover:bg-[#677DB7]/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Pitch
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold">Pitch</TableHead>
                      <TableHead className="font-semibold">Progress</TableHead>
                      <TableHead className="font-semibold">Profit Share</TableHead>
                      <TableHead className="font-semibold">Dividend Period</TableHead>
                      <TableHead className="font-semibold">Funding End</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pitches.map((pitch) => {
                      const progress = (pitch.raised_amount / Number(pitch.target_investment_amount || 1)) * 100;
                      const isAdPaymentDue = (pitch.status == "funded") && pitch.total_advert_clicks > 0;
                      const isProfitReportDue = hasDateBeenReached(pitch.next_payout_date);

                      return (
                        <TableRow
                          key={pitch.pitch_id}
                          className={`cursor-pointer transition-colors ${isAdPaymentDue
                            ? "bg-purple-50 hover:bg-purple-100 border-l-4 border-l-purple-400"
                            : isProfitReportDue
                              ? "bg-orange-50 hover:bg-orange-100 border-l-4 border-l-orange-400"
                              : "hover:bg-gray-50"
                            }`}
                          onClick={() => {
                            if (isAdPaymentDue) {
                              handleAdRowClick(pitch);
                            } else if (isProfitReportDue) {
                              handleProfitRowCLick(pitch);
                            } else {
                              handleRowClick(pitch);
                            }
                          }}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {pitch.product_title}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-2 min-w-[200px]">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">{progress.toFixed(0)}%</span>
                                <span className="text-gray-500">
                                  {formatCurrency(pitch.raised_amount)} / {formatCurrency(Number(pitch.target_investment_amount))}
                                </span>
                              </div>
                              <Progress
                                value={progress}
                                className="h-2"
                              />
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline" className="font-medium">
                              {pitch.investor_profit_share_percent}%
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {pitch.dividend_payout_period}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {pitch.end_date.toDateString()}
                            </span>
                          </TableCell>

                          <TableCell>
                            {getPitchStatusBadge(pitch)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
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
    </div>
  );
}
