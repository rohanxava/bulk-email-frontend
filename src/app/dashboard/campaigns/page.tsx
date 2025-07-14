'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '../page-header';
import { getCampaigns, deleteCampaign } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { Campaign } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const statusConfig: Record<Campaign['status'], { className: string }> = {
  Sent: { className: 'bg-primary text-primary-foreground' },
  Active: { className: 'bg-accent text-accent-foreground' },
  Draft: { className: 'bg-muted text-muted-foreground' },
  Failed: { className: 'bg-destructive text-destructive-foreground' },
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getCampaigns()
      .then(setCampaigns)
      .catch((err) => {
        console.error('Failed to fetch campaigns', err);
        toast({
          title: 'Error',
          description: 'Failed to load campaigns',
          variant: 'destructive',
        });
      });
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCampaign(deleteId);
      setCampaigns((prev) => prev.filter((c) => c._id !== deleteId));
      toast({ title: 'Campaign deleted successfully' });
    } catch (err: any) {
      console.error('Delete error:', err);
      toast({
        title: 'Failed to delete campaign',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
      setOpen(false);
    }
  };



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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <TableRow key={campaign._id}>
                    <TableCell className="font-medium">{campaign.campaignName}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[campaign.status]?.className}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign.recipients || 0}</TableCell>
                    <TableCell>{campaign.createdBy?.name || '-'}</TableCell>
                    <TableCell>
                      {campaign.createdDate
                        ? format(new Date(campaign.createdDate), "PPP 'at' p")
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/dashboard/campaigns/${campaign._id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setDeleteId(campaign._id);
                          setOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No campaigns found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 🧾 Delete Confirmation Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the campaign.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
