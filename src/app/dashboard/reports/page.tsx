"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PageHeader } from "../page-header";
import { getCampaigns } from "@/services/api";

const chartConfig = {
  opens: {
    label: "Opens",
    color: "hsl(var(--primary))",
  },
  clicks: {
    label: "Clicks",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

export default function ReportsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCampaigns();
        setCampaigns(data);

        // Fix: Use correct field and sort by createdDate
        const generatedChartData = data
          .filter((campaign: any) => campaign.createdDate) // Optional safety
          .sort(
            (a, b) =>
              new Date(a.createdDate).getTime() -
              new Date(b.createdDate).getTime()
          )
          .slice(0, 5)
          .map((campaign: any) => ({
            date: new Date(campaign.createdDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            opens: campaign.stats?.opened || 0,
            clicks: campaign.stats?.clicks || 0,
          }));

        setChartData(generatedChartData);
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Analyze the performance of your email campaigns."
      />

      {/* Chart Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>
            Opens and Clicks in the last few campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 overflow-auto">
          <div className="min-w-[800px] h-[350px]">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="opens"
                    stroke="var(--color-opens)"
                    activeDot={{ r: 6 }}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="var(--color-clicks)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Reports</CardTitle>
          <CardDescription>
            Detailed breakdown of recent campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Opens</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>Click Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((report: any, index: number) => {
                const delivered = report.recipients || 0;
                const opens = report.stats?.opened || 0;
                const clicks = report.stats?.clicks || 0;

                const openRate =
                  delivered > 0
                    ? ((opens / delivered) * 100).toFixed(1) + "%"
                    : "0%";
                const clickRate =
                  opens > 0
                    ? ((clicks / opens) * 100).toFixed(1) + "%"
                    : "0%";

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {report.campaignName}
                    </TableCell>
                    <TableCell>{delivered.toLocaleString()}</TableCell>
                    <TableCell>{opens.toLocaleString()}</TableCell>
                    <TableCell>{clicks.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{openRate}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{clickRate}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
