'use client';
import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { PageHeader } from './page-header';
import { Button } from '@/components/ui/button';
import { Mail, Users, MousePointerClick, ArrowUpRight, MailOpen } from 'lucide-react';
import type { Campaign } from '@/lib/types';
import { getCampaigns } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

const chartData = [
  { name: 'Jan', desktop: 186, mobile: 80 },
  { name: 'Feb', desktop: 305, mobile: 200 },
  { name: 'Mar', desktop: 237, mobile: 120 },
  { name: 'Apr', desktop: 73, mobile: 190 },
  { name: 'May', desktop: 209, mobile: 130 },
  { name: 'Jun', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--primary))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--secondary))',
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const [recentCampaigns, setRecentCampaigns] = React.useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = React.useState(true);

  React.useEffect(() => {
    const fetchRecentCampaigns = async () => {
      setLoadingCampaigns(true);
      try {
        const campaigns = await getCampaigns();
        setRecentCampaigns(campaigns.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch campaigns", error);
      } finally {
        setLoadingCampaigns(false);
      }
    };
    fetchRecentCampaigns();
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Here's a high-level overview of your marketing performance."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,408</div>
            <p className="text-xs text-muted-foreground">+12.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <MailOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+1,284</div>
            <p className="text-xs text-muted-foreground">+8.7% from last month</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Monthly open rates by device</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pl-2">
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false}/>
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Your 5 most recent campaigns.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {loadingCampaigns ? (
              Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                      <div className="grid gap-2 w-full">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-5 w-12 ml-auto" />
                  </div>
              ))
            ) : recentCampaigns.length > 0 ? (
              recentCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center gap-4">
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">{campaign.status}</p>
                  </div>
                  <div className="ml-auto font-medium">{typeof campaign.recipients === 'number' ? `+${campaign.recipients.toLocaleString()}` : campaign.recipients}</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center pt-8">No recent campaigns.</p>
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
    </div>
  );
}
