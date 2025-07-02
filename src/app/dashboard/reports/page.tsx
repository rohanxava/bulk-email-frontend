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

        // Prepare chart data (optional customization)
        const generatedChartData = data.slice(0, 5).map((campaign) => ({
          date: new Date(campaign.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          opens: campaign.opens || 0,
          clicks: campaign.clicks || 0,
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
              <LineChart data={chartData} width={800} height={350}>
                <CartesianGrid vertical={false} />
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
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
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
                const openRate =
                  report.delivered > 0
                    ? ((report.opens / report.delivered) * 100).toFixed(1) + "%"
                    : "0%";
                const clickRate =
                  report.opens > 0
                    ? ((report.clicks / report.opens) * 100).toFixed(1) + "%"
                    : "0%";
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{report.delivered?.toLocaleString()}</TableCell>
                    <TableCell>{report.opens?.toLocaleString()}</TableCell>
                    <TableCell>{report.clicks?.toLocaleString()}</TableCell>
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
