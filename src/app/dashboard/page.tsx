'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { PageHeader } from './page-header';

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
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Here's a high-level overview of your marketing performance."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Emails Sent</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12,408</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open Rate</CardTitle>
            <CardDescription>Average over last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">24.5%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Click Rate</CardTitle>
            <CardDescription>Average over last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">4.2%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New Subscribers</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">+1,284</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Monthly open rates by device</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
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
      </div>
    </div>
  );
}
