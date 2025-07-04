"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PageHeader } from "./page-header";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Users,
  MousePointerClick,
  ArrowUpRight,
  MailOpen,
} from "lucide-react";
import {
  getCampaigns,
  getAnalyticsSummary,
  getCampaignStatusCounts,
} from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Campaign } from "@/lib/types";

// Colors for bar chart
const barChartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--primary))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

const statusConfig: Record<Campaign["status"], { className: string }> = {
  Sent: {
    className:
      "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
  },
  Active: {
    className:
      "border-transparent bg-accent text-accent-foreground hover:bg-accent/80",
  },
  Draft: {
    className:
      "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
  },
  Failed: {
    className:
      "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
  },
};

export default function DashboardPage() {
  const [allCampaigns, setAllCampaigns] = React.useState<Campaign[]>([]);
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [statusCounts, setStatusCounts] = React.useState<any[]>([]);

  const [loadingCampaigns, setLoadingCampaigns] = React.useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = React.useState(true);
  const [loadingStatusCounts, setLoadingStatusCounts] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignsData, analyticsData, statusData] = await Promise.all([
          getCampaigns(),
          getAnalyticsSummary(),
          getCampaignStatusCounts(),
        ]);
        setAllCampaigns(campaignsData);
        setAnalytics(analyticsData);
        setStatusCounts(statusData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoadingCampaigns(false);
        setLoadingAnalytics(false);
        setLoadingStatusCounts(false);
      }
    };
    fetchData();
  }, []);

  const recentCampaigns = allCampaigns.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="High-level marketing performance overview."
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Emails Sent"
          icon={<Mail className="h-5 w-5 text-primary" />}
          value={analytics?.totalEmailsSent}
          loading={loadingAnalytics}
        />
        <DashboardCard
          title="Open Rate"
          icon={<MailOpen className="h-5 w-5 text-accent" />}
          value={`${analytics?.openRate || 0}%`}
          loading={loadingAnalytics}
        />
        <DashboardCard
          title="Click Rate"
          icon={<MousePointerClick className="h-5 w-5 text-primary" />}
          value={`${analytics?.clickRate || 0}%`}
          loading={loadingAnalytics}
        />
        <DashboardCard
          title="New Subscribers"
          icon={<Users className="h-5 w-5 text-accent" />}
          value={analytics?.newSubscribers}
          loading={loadingAnalytics}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Campaign Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Monthly open rates by device</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] overflow-x-auto">
            <div className="min-w-[700px] pl-2">
              {loadingAnalytics ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ChartContainer config={barChartConfig}>
                  <BarChart data={analytics?.monthlyPerformance || []}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickMargin={10} axisLine={false} />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
                    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={8} />
                  </BarChart>
                </ChartContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Status */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Status</CardTitle>
            <CardDescription>Breakdown of all campaign statuses</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            {loadingStatusCounts ? (
              <Skeleton className="w-48 h-48 rounded-full" />
            ) : statusCounts.length > 0 ? (
              <PieChart width={300} height={300}>
                <Pie
                  data={statusCounts}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  label
                >
                  {statusCounts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        {
                          Sent: "hsl(var(--chart-1))",
                          Active: "hsl(var(--chart-2))",
                          Draft: "hsl(var(--muted-foreground))",
                          Failed: "hsl(var(--destructive))",
                        }[entry.status] || "#ccc"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <p className="text-muted-foreground text-sm">
                No campaign data available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>Your 5 most recent campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCampaigns ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>{campaign.campaignName}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[campaign.status]?.className}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign.recipients?.toLocaleString?.()}</TableCell>
                    <TableCell>{format(new Date(campaign.createdDate), "PPP")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {!loadingCampaigns && recentCampaigns.length > 0 && (
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/dashboard/campaigns">
                View All Campaigns
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

// Mini component for top summary cards
function DashboardCard({
  title,
  icon,
  value,
  loading,
}: {
  title: string;
  icon: React.ReactNode;
  value: any;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">Compared to last month</p>
      </CardContent>
    </Card>
  );
}
