
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2 } from 'lucide-react';
import { SuggestSendTimeClient } from './suggest-send-time-client';
import { useToast } from '@/hooks/use-toast';
import { sendCampaign } from '@/ai/flows/send-campaign';
import type { Project } from '@/lib/types';

interface NewCampaignClientProps {
  projects: Project[];
}

export function NewCampaignClient({ projects }: NewCampaignClientProps) {
  const [campaignName, setCampaignName] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [emailContent, setEmailContent] = React.useState('');
  const [csvContent, setCsvContent] = React.useState<string | null>(null);
  const [csvFileName, setCsvFileName] = React.useState<string | null>(null);
  const [isSending, setIsSending] = React.useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        setCsvContent(text as string);
      };
      reader.readAsText(file);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignName || !subject || !emailContent || !csvContent) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all fields and upload a contacts file.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const result = await sendCampaign({
        subject,
        htmlContent: emailContent,
        csvContent,
        // TODO: Replace with a dynamic email from user/project settings
        fromEmail: 'no-reply@example.com',
      });

      if (result.success) {
        toast({
          title: 'Campaign Sent!',
          description: `${result.emailsSent} emails have been queued for sending.`,
        });
      } else {
        toast({
          title: 'Error Sending Campaign',
          description: result.error || 'An unknown error occurred.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to send campaign:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please check the console.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects && projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template">Template (Optional)</Label>
                <Select>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Email</SelectItem>
                    <SelectItem value="promo">Product Promotion</SelectItem>
                    <SelectItem value="update">Feature Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="e.g., Q4 Product Launch"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                placeholder="e.g., Big News! Our new feature is here."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-content">Email Content</Label>
              <Textarea
                id="email-content"
                placeholder="Craft your email here. Use {{variable}} for personalization."
                className="min-h-[250px]"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contacts-file" className="block mb-2">Upload Contacts (CSV)</Label>
              <div className="flex items-center justify-center w-full">
                  <label htmlFor="contacts-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2">
                          <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                           {csvFileName ? (
                              <p className="text-sm text-muted-foreground truncate">{csvFileName}</p>
                          ) : (
                              <>
                                  <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                  <p className="text-xs text-muted-foreground">CSV file</p>
                              </>
                          )}
                      </div>
                      <Input id="contacts-file" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                  </label>
              </div>
            </div>
            
            <SuggestSendTimeClient emailContent={emailContent} />

          </CardContent>
        </Card>
        <Button size="lg" className="w-full bg-accent hover:bg-accent/90" onClick={handleSendCampaign} disabled={isSending}>
          {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Send Campaign
        </Button>
        <Button size="lg" variant="outline" className="w-full">
          Save as Draft
        </Button>
      </div>
    </div>
  );
}

