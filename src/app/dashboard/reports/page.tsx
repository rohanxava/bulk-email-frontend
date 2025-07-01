"use client";

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

const reportData = [
  {
    name: "Q3 Product Update",
    sent: 5230,
    delivered: 5201,
    opens: 1872,
    clicks: 312,
  },
  {
    name: "Summer Sale Kickoff",
    sent: 15000,
    delivered: 14890,
    opens: 4318,
    clicks: 982,
  },
  {
    name: "Weekly Newsletter #128",
    sent: 8942,
    delivered: 8899,
    opens: 2135,
    clicks: 445,
  },
  {
    name: "Weekly Newsletter #127",
    sent: 8930,
    delivered: 8901,
    opens: 2210,
    clicks: 450,
  },
  {
    name: "Weekly Newsletter #126",
    sent: 8915,
    delivered: 8880,
    opens: 2190,
    clicks: 435,
  },
];

const chartData = [
  { date: "Jul 1", opens: 4000, clicks: 2400 },
  { date: "Jul 8", opens: 3000, clicks: 1398 },
  { date: "Jul 15", opens: 2000, clicks: 9800 },
  { date: "Jul 22", opens: 2780, clicks: 3908 },
  { date: "Jul 29", opens: 1890, clicks: 4800 },
];

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
            Opens and Clicks in the last 30 days.
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
              {reportData.map((report, index) => {
                const openRate =
                  ((report.opens / report.delivered) * 100).toFixed(1) + "%";
                const clickRate =
                  ((report.clicks / report.opens) * 100).toFixed(1) + "%";
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{report.delivered.toLocaleString()}</TableCell>
                    <TableCell>{report.opens.toLocaleString()}</TableCell>
                    <TableCell>{report.clicks.toLocaleString()}</TableCell>
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
