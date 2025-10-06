"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip as ReTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { User, LineChart as ChartIcon, Coins, BarChart3 } from "lucide-react";
import { getInvestorInfo, getDividends, getInvestments, depositFunds, withdrawFunds } from "./_actions";
import { useEffect, useState } from "react";
import { InvestmentRecord, InvestorAccount, Transaction } from "@/db/types";
import { FundsDialog } from "@/components/funds_dialog";

/**
 * Investor Portal Page, showing an overview of the investor account, their investments and dividends
 * @returns The investor portal page
 */
export default function InvestorPortalPage() {

  const [investorInfo, setInvestorInfo] = useState<InvestorAccount | null>(null);
  const [investments, setInvestments] = useState<InvestmentRecord[]>([]);
  const [dividends, setDividends] = useState<Transaction[]>([]);
  const [reloadInvestorInfo, setReloadInvestorInfo] = useState(false);

  useEffect(() => {
    async function loadData() {
      const info = await getInvestorInfo();
      const invs = await getInvestments();
      const divs = await getDividends();
      setInvestorInfo(info);
      setInvestments(invs);
      setDividends(divs);
    }
    loadData();
  }, [reloadInvestorInfo]);

  if (!investorInfo) {
    return <div className="p-6">No investor profile found.</div>;
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount_invested, 0);
  const totalShares = investments.reduce((sum, inv) => sum + inv.shares_allocated, 0);
  const totalDividends = dividends.reduce((sum, d) => sum + d.amount, 0);
  const roiPercent = ((totalDividends / totalInvested) * 100).toFixed(2);

  let cumulative = 0;
  const dividendsOverTime = dividends
    .sort((a, b) => a.created_at!.getTime() - b.created_at!.getTime())
    .map((d) => {
      cumulative += d.amount;
      return { date: d.created_at, cumulative };
    });

  let runningDividends = 0;
  const roiOverTime = dividends
    .sort((a, b) => a.created_at!.getTime() - b.created_at!.getTime())
    .map((d) => {
      runningDividends += d.amount;
      const roi = (runningDividends / totalInvested) * 100;
      return { date: d.created_at, roi: parseFloat(roi.toFixed(2)) };
    });

  function onDepositFunds(amount: number) {
    return depositFunds(amount).then(() => {
      setReloadInvestorInfo(!reloadInvestorInfo);
    })
  }

  function onWithdrawFunds(amount: number) {
    return withdrawFunds(amount).then(() => {
      setReloadInvestorInfo(!reloadInvestorInfo);
    })
  }

  return (
    <div className="p-6">
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="dividends">Dividends</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Investor Info */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>{investorInfo.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{investorInfo.email}</p>
              </div>
            </CardHeader>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="grid-rows-2 grid-flow-col flex items-center justify-between py-6">
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="text-xl font-semibold">${investorInfo.wallet_balance}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <FundsDialog mode="deposit" balance={investorInfo.wallet_balance} onSubmit={onDepositFunds} />
                  <FundsDialog mode="withdraw" balance={investorInfo.wallet_balance} onSubmit={onWithdrawFunds} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between py-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-xl font-semibold">${totalInvested}</p>
                </div>
                <BarChart3 className="w-6 h-6 text-green-600" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between py-6">
                <div>
                  <p className="text-sm text-muted-foreground">Shares Owned</p>
                  <p className="text-xl font-semibold">{totalShares}</p>
                </div>
                <Coins className="w-6 h-6 text-yellow-600" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between py-6">
                <div>
                  <p className="text-sm text-muted-foreground">Dividends Earned</p>
                  <p className="text-xl font-semibold">${totalDividends}</p>
                </div>
                <Coins className="w-6 h-6 text-indigo-600" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between py-6">
                <div>
                  <p className="text-sm text-muted-foreground">ROI</p>
                  <p className="text-xl font-semibold">{roiPercent}%</p>
                </div>
                <ChartIcon className="w-6 h-6 text-emerald-600" />
              </CardContent>
            </Card>
          </div>

          {/* ROI Over Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle>ROI Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 bg-muted rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={roiOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" tickFormatter={(v) => `${v}%`} />
                    <ReTooltip formatter={(val) => `${val}%`} />
                    <Line
                      type="monotone"
                      dataKey="roi"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="ROI %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investments */}
        <TabsContent value="investments">
          <Card>
            <CardHeader>
              <CardTitle>Investments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pitch</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Tier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>{inv.investment_date!.toDateString()}</TableCell>
                      <TableCell>${inv.amount_invested}</TableCell>
                      <TableCell>{inv.shares_allocated}</TableCell>
                      <TableCell>{inv.tier}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Investment Bar Chart */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Investment Breakdown</h4>
                <div className="h-64 bg-muted rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={investments}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="pitchName" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <ReTooltip />
                      <Bar dataKey="investmentCost" fill="#22c55e" name="Investment ($)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dividends */}
        <TabsContent value="dividends">
          <Card>
            <CardHeader>
              <CardTitle>Dividends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pitch</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dividends.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell>{d.related_pitch_id}</TableCell>
                      <TableCell>{d.amount}</TableCell>
                      <TableCell>${d.created_at!.toDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Cumulative Dividends Chart */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Cumulative Dividends Over Time</h4>
                <div className="h-64 bg-muted rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dividendsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <ReTooltip />
                      <Line
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        name="Cumulative Dividends ($)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
