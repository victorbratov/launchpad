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
import {
  User,
  LineChart as ChartIcon,
  Coins,
  BarChart3,
  TrendingUp,
  Wallet,
  Calendar,
  PieChart,
  Activity
} from "lucide-react";
import { getInvestorInfo, getDividends, getInvestments, depositFunds, withdrawFunds, InvestmentEnriched, getTransactions } from "./_actions";
import { useEffect, useState } from "react";
import { InvestmentRecord, InvestorAccount, Transaction } from "@/db/types";
import { FundsDialog } from "@/components/funds_dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Investor Portal Page, showing an overview of the investor account, their investments and dividends
 * @returns The investor portal page
 */
export default function InvestorPortalPage() {
  const [investorInfo, setInvestorInfo] = useState<InvestorAccount | null>(null);
  const [investments, setInvestments] = useState<InvestmentEnriched[]>([]);
  const [dividends, setDividends] = useState<Transaction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reloadInvestorInfo, setReloadInvestorInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [info, invs, divs, txns] = await Promise.all([
          getInvestorInfo(),
          getInvestments(),
          getDividends(),
          getTransactions()
        ]);
        setInvestorInfo(info);
        setInvestments(invs);
        setDividends(divs);
        setTransactions(txns);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [reloadInvestorInfo]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!investorInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <Card className="max-w-md mx-auto mt-20">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Investor Profile Found</h3>
            <p className="text-gray-600">Please contact support to set up your investor account.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculations
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount_invested, 0);
  const totalShares = investments.reduce((sum, inv) => sum + inv.shares_allocated, 0);
  const totalDividends = dividends.reduce((sum, d) => sum + d.amount, 0);
  const roiPercent = totalInvested > 0 ? ((totalDividends / totalInvested) * 100).toFixed(2) : '0.00';

  // Chart data
  let cumulative = 0;
  const dividendsOverTime = dividends
    .sort((a, b) => a.created_at!.getTime() - b.created_at!.getTime())
    .map((d) => {
      cumulative += d.amount;
      return {
        date: d.created_at?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cumulative: parseFloat(cumulative.toFixed(2))
      };
    });

  let runningDividends = 0;
  const roiOverTime = dividends
    .sort((a, b) => a.created_at!.getTime() - b.created_at!.getTime())
    .map((d) => {
      runningDividends += d.amount;
      const roi = totalInvested > 0 ? (runningDividends / totalInvested) * 100 : 0;
      return {
        date: d.created_at?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        roi: parseFloat(roi.toFixed(2))
      };
    });

  async function onDepositFunds(amount: number) {
    try {
      await depositFunds(amount);
      setReloadInvestorInfo(!reloadInvestorInfo);
    } catch (error) {
      console.error('Error depositing funds:', error);
    }
  }

  async function onWithdrawFunds(amount: number) {
    try {
      await withdrawFunds(amount);
      setReloadInvestorInfo(!reloadInvestorInfo);
    } catch (error) {
      console.error('Error withdrawing funds:', error);
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investor Portal</h1>
          <p className="text-gray-600">Manage your investments and track your portfolio performance</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="investments" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Investments
            </TabsTrigger>
            <TabsTrigger value="dividends" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Dividends
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-blue-600 text-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <User className="w-10 h-10" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">{investorInfo.name}</h2>
                    <p className="text-blue-100 mb-4">{investorInfo.email}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {new Date(investorInfo.created_at!).getFullYear()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Wallet Balance"
                value={formatCurrency(investorInfo.wallet_balance)}
                icon={<Wallet className="w-6 h-6 text-blue-600" />}
                trend={null}
                extra={
                  <div className="flex gap-2 mt-4">
                    <FundsDialog mode="deposit" balance={investorInfo.wallet_balance} onSubmit={onDepositFunds} />
                    <FundsDialog mode="withdraw" balance={investorInfo.wallet_balance} onSubmit={onWithdrawFunds} />
                  </div>
                }
              />

              <StatsCard
                title="Total Invested"
                value={formatCurrency(totalInvested)}
                icon={<TrendingUp className="w-6 h-6 text-green-600" />}
                trend={null}
              />

              <StatsCard
                title="Shares Owned"
                value={totalShares.toLocaleString()}
                icon={<Coins className="w-6 h-6 text-yellow-600" />}
                trend={null}
              />

              <StatsCard
                title="Dividends Earned"
                value={formatCurrency(totalDividends)}
                icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
                trend={`${roiPercent}% ROI`}
              />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard
                title="ROI Over Time"
                data={roiOverTime}
                dataKey="roi"
                color="#22c55e"
                formatter={(v) => `${v}%`}
              />
              <ChartCard
                title="Cumulative Dividends"
                data={dividendsOverTime}
                dataKey="cumulative"
                color="#0ea5e9"
                formatter={(v) => `$${v}`}
              />
            </div>
          </TabsContent>

          <TabsContent value="investments">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600">Your Investments</CardTitle>
                <p className="text-gray-600">Track your portfolio performance and allocation</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {investments.length === 0 ? (
                  <EmptyState
                    icon={<BarChart3 className="w-16 h-16 text-gray-400" />}
                    title="No investments yet"
                    description="Start investing to see your portfolio here"
                  />
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pitch</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Shares</TableHead>
                            <TableHead>Tier</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {investments.map((inv) => (
                            <TableRow key={inv.id}>
                              <TableCell className="font-medium">{inv.pitchTitle}</TableCell>
                              <TableCell>{inv.investment_date!.toLocaleDateString()}</TableCell>
                              <TableCell>{formatCurrency(inv.amount_invested)}</TableCell>
                              <TableCell>{inv.shares_allocated.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{inv.tier}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    inv.pitchStatus === 'funded' ? 'default' :
                                      inv.pitchStatus === 'failed' ? 'destructive' : 'secondary'
                                  }
                                >
                                  {inv.pitchStatus}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Investment Bar Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Investment Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={investments} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis
                                dataKey="pitchTitle"
                                stroke="#6b7280"
                                tick={{ fontSize: 12 }}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={100}
                              />
                              <YAxis stroke="#6b7280" tickFormatter={(v) => `$${v}`} />
                              <ReTooltip formatter={(v) => [formatCurrency(Number(v)), "Investment"]} />
                              <Bar dataKey="amount_invested" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dividends">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600">Dividend History</CardTitle>
                <p className="text-gray-600">Track your dividend earnings over time</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {dividends.length === 0 ? (
                  <EmptyState
                    icon={<Coins className="w-16 h-16 text-gray-400" />}
                    title="No dividends yet"
                    description="Dividends will appear here once your investments start generating returns"
                  />
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Pitch ID</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dividends.map((d, i) => (
                            <TableRow key={i}>
                              <TableCell>{d.created_at!.toLocaleDateString()}</TableCell>
                              <TableCell className="font-medium text-green-600">{formatCurrency(d.amount)}</TableCell>
                              <TableCell>{d.related_pitch_id}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Cumulative Dividends Over Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dividendsOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="date" stroke="#6b7280" />
                              <YAxis stroke="#6b7280" tickFormatter={(v) => `$${v}`} />
                              <ReTooltip formatter={(v) => [formatCurrency(Number(v)), "Cumulative Dividends"]} />
                              <Line
                                type="monotone"
                                dataKey="cumulative"
                                stroke="#0ea5e9"
                                strokeWidth={3}
                                dot={{ r: 5, fill: "#0ea5e9" }}
                                activeDot={{ r: 7 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600">Transaction History</CardTitle>
                <p className="text-gray-600">View all your account transactions</p>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <EmptyState
                    icon={<Activity className="w-16 h-16 text-gray-400" />}
                    title="No transactions yet"
                    description="Your transaction history will appear here"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tnx) => (
                          <TableRow key={tnx.id}>
                            <TableCell>{tnx.created_at?.toLocaleDateString()}</TableCell>
                            <TableCell className={tnx.txn_type?.includes('withdrawal') ? 'text-red-600' : 'text-green-600'}>
                              {formatCurrency(tnx.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {tnx.txn_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={tnx.tnx_status === 'completed' ? 'default' : 'secondary'}
                                className="capitalize"
                              >
                                {tnx.tnx_status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper Components
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="container mx-auto">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, trend, extra }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string | null;
  extra?: React.ReactNode;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">{title}</p>
          {icon}
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 font-medium">{trend}</p>
        )}
        {extra && extra}
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, data, dataKey, color, formatter }: {
  title: string;
  data: any[];
  dataKey: string;
  color: string;
  formatter: (value: any) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={formatter} />
              <ReTooltip formatter={(v) => [formatter(v), title]} />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={3}
                dot={{ r: 4, fill: color }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
