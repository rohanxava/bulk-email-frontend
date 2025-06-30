
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { PageHeader } from '../page-header';
import { getCampaigns } from '@/services/api';
import { format } from 'date-fns';

const statusVariant = {
  Sent: 'default',
  Active: 'secondary',
  Draft: 'outline',
  Failed: 'destructive',
} as const;

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

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
                <TableHead>Created By</TableHead>
                <TableHead>Created Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns && campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[campaign.status] || 'default'}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{typeof campaign.recipients === 'number' ? campaign.recipients.toLocaleString() : campaign.recipients}</TableCell>
                    <TableCell>{campaign.createdBy}</TableCell>
                    <TableCell>
                      {campaign.createdDate === 'N/A'
                        ? 'N/A'
                        : format(new Date(campaign.createdDate), 'PPP')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No campaigns found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
