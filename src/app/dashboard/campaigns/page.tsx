import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { PageHeader } from '../page-header';

const campaigns = [
  { name: 'Q3 Product Update', status: 'Sent', recipients: 5230, sentDate: '2024-07-20' },
  { name: 'Summer Sale Kickoff', status: 'Sent', recipients: 15000, sentDate: '2024-07-15' },
  { name: 'Welcome Series - Email 1', status: 'Active', recipients: 'Ongoing', sentDate: '2024-07-01' },
  { name: 'New Feature Announcement', status: 'Draft', recipients: 0, sentDate: 'N/A' },
  { name: 'Weekly Newsletter #128', status: 'Sent', recipients: 8942, sentDate: '2024-07-18' },
];

const statusVariant = {
  Sent: 'default',
  Active: 'secondary',
  Draft: 'outline',
  Failed: 'destructive',
};

export default function CampaignsPage() {
  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Create and manage your email campaigns."
      >
        <Button asChild>
          <Link href="/dashboard/campaigns/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Campaign
          </Link>
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>A list of your recent email campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Sent Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[campaign.status as keyof typeof statusVariant] || 'default'}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{campaign.recipients.toLocaleString()}</TableCell>
                  <TableCell>{campaign.sentDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
