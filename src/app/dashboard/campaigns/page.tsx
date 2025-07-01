
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { PageHeader } from '../page-header';
import { getCampaigns } from '@/services/api';
import { format } from 'date-fns';
import type { Campaign } from '@/lib/types';

const statusConfig: Record<Campaign['status'], { className: string }> = {
  Sent: { className: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80' },
  Active: { className: 'border-transparent bg-accent text-accent-foreground hover:bg-accent/80' },
  Draft: { className: 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80' },
  Failed: { className: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80' },
};


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
                      <Badge className={statusConfig[campaign.status]?.className}>
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
