'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';
import { PageHeader } from '../../page-header';
import { SuggestSendTimeClient } from './suggest-send-time-client';

export default function NewCampaignPage() {
  const [emailContent, setEmailContent] = React.useState('');

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Create New Campaign"
        description="Set up your email, upload contacts, and send your campaign."
      />
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
                      <SelectItem value="alpha">Alpha Campaign</SelectItem>
                      <SelectItem value="beta">Beta Launch Promo</SelectItem>
                      <SelectItem value="newsletter">Client Newsletter</SelectItem>
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
                <Input id="campaign-name" placeholder="e.g., Q4 Product Launch" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input id="subject" placeholder="e.g., Big News! Our new feature is here." />
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
                <Label htmlFor="contacts-file" className="block mb-2">Upload Contacts (CSV/Excel)</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="contacts-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">CSV or XLSX</p>
                        </div>
                        <Input id="contacts-file" type="file" className="hidden" />
                    </label>
                </div>
              </div>
              
              <SuggestSendTimeClient emailContent={emailContent} />

            </CardContent>
          </Card>
          <Button size="lg" className="w-full bg-accent hover:bg-accent/90">
            Send Campaign
          </Button>
          <Button size="lg" variant="outline" className="w-full">
            Save as Draft
          </Button>
        </div>
      </div>
    </div>
  );
}
