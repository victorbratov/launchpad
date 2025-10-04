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
import { User, Wallet, LineChart as ChartIcon, Coins, BarChart3 } from "lucide-react";
import { getInvestorInfo, getDividends, getInvestments } from "./_actions";
import { useEffect, useState } from "react";
import { Dividend, Investment, InvestorInfo } from "../../../types/investor_data";
import WithdrawDialog from "@/components/withdrawal_dialog";
import DepositDialog from "@/components/deposit_dialog";
import { withdrawBalance, depositBalance } from "./_actions";
import { validateWithdrawalAmount } from "@/lib/utils"; 

/**
 * Investor Portal Page, showing an overview of the investor account, their investments and dividends
 * @returns The investor portal page
 */
export default function InvestorPortalPage() {

  const [investorInfo, setInvestorInfo] = useState<InvestorInfo | null>(null);
  const [investments, setInvestments] = useState<Array<Investment>>([]);
  const [dividends, setDividends] = useState<Array<Dividend>>([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);
  const [withdrawing, setWithdrawing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [depositing, setDepositing] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [openDeposit, setOpenDeposit] = useState<boolean>(false);

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
  }, []);

  if (!investorInfo) {
    return <div className="p-6">No investor profile found.</div>;
  }

  // --- Calculations ---
  const totalInvested = investments.reduce((sum, inv) => sum + inv.investmentCost, 0);
  const totalShares = investments.reduce((sum, inv) => sum + inv.shareAmount!, 0);
  const totalDividends = dividends.reduce((sum, d) => sum + d.dividendAmount, 0);
  const roiPercent = ((totalDividends / totalInvested) * 100).toFixed(2);

  let cumulative = 0;
  const dividendsOverTime = dividends
    .sort((a, b) => new Date(a.dividendDate).getTime() - new Date(b.dividendDate).getTime())
    .map((d) => {
      cumulative += d.dividendAmount;
      return { date: d.dividendDate, cumulative };
    });

  let runningDividends = 0;
  const roiOverTime = dividends
    .sort((a, b) => new Date(a.dividendDate).getTime() - new Date(b.dividendDate).getTime())
    .map((d) => {
      runningDividends += d.dividendAmount;
      const roi = (runningDividends / totalInvested) * 100;
      return { date: d.dividendDate, roi: parseFloat(roi.toFixed(2)) };
    });


  /**
   * Handle the withdrawal of funds from the business account
   * @param amount The amount to withdraw
   */
  async function withdrawFunds(amount: number | null) {
    setWithdrawing(true);

    setErrorMessage(validateWithdrawalAmount(amount, investorInfo?.walletAmount ?? 0));

    if (errorMessage === null) {
      try {
        await withdrawBalance(amount ?? investorInfo?.walletAmount ?? 0);
        setOpen(false);
        // get updated info
        const info = await getInvestorInfo();
        setInvestorInfo(info);
      } catch (error) {
        setErrorMessage("Error withdrawing funds. Please try again later.");
        setWithdrawing(false);
      } 
    } else {
      setWithdrawing(false);
    }
  }

  /**
   * Handle the deposit of funds into the business account
   * @param amount The amount to deposit
   */
  async function depositFunds(amount: number | null) {
      setDepositing(true);
  
      try {
        await depositBalance(amount ?? investorInfo?.walletAmount ?? 0);
        setOpenDeposit(false);
        // get updated info
        const info = await getInvestorInfo();
        setInvestorInfo(info);
      } catch (error) {
        setErrorMessage("Error withdrawing funds. Please try again later.");
        setDepositing(false);
      }
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
                <p className="text-sm text-muted-foreground">
                  Bank Acc: ****{String(investorInfo.bankAccNum).slice(-4)}
                </p>
              </div>
            </CardHeader>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="grid grid-rows-2 grid-flow-col flex items-center justify-between py-6">
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="text-xl font-semibold">${investorInfo.walletAmount}</p>
                </div>
                {/* <Wallet className="w-6 h-6 text-primary" /> */}
                {/* {investorInfo?.walletAmount != 0 && */}
                <div className="flex flex-col space-y-2">
                <WithdrawDialog
                  accountInfo={investorInfo ? { wallet: investorInfo.walletAmount } : { wallet: 0 }}
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
                <DepositDialog
                  accountInfo={investorInfo ? { wallet: investorInfo.walletAmount } : { wallet: 0 }}
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
                    <TableRow key={inv.investmentID}>
                      <TableCell>{inv.pitchName}</TableCell>
                      <TableCell>{inv.investmentDate}</TableCell>
                      <TableCell>${inv.investmentCost}</TableCell>
                      <TableCell>{inv.shareAmount}</TableCell>
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
                      <TableCell>{d.pitchName}</TableCell>
                      <TableCell>{d.dividendDate}</TableCell>
                      <TableCell>${d.dividendAmount}</TableCell>
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
