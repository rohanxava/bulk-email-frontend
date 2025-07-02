'use client';
import { useEffect, useState } from 'react';
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
  Sent: { className: 'bg-primary text-primary-foreground' },
  Active: { className: 'bg-accent text-accent-foreground' },
  Draft: { className: 'bg-muted text-muted-foreground' },
  Failed: { className: 'bg-destructive text-destructive-foreground' },
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    getCampaigns()
      .then(setCampaigns)
      .catch((err) => console.error('Failed to fetch campaigns', err));
  }, []);

  return (
    <div>
      <PageHeader title="Campaigns" description="Create and manage your email campaigns.">
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
          <CardDescription>List of all your campaigns.</CardDescription>
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
              {campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <TableRow key={campaign._id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[campaign.status]?.className}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign.recipients || 0}</TableCell>
                    <TableCell>{campaign.createdBy || '-'}</TableCell>
                    <TableCell>
                      {campaign.createdDate
                        ? format(new Date(campaign.createdDate), 'PPP')
                        : 'N/A'}
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
