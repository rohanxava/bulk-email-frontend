
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, Eye, Save } from 'lucide-react';
import { SuggestSendTimeClient } from './suggest-send-time-client';
import { useToast } from '@/hooks/use-toast';
import { sendCampaign } from '@/ai/flows/send-campaign';
import { saveCampaign } from '@/services/api';
import type { Project, Template, Campaign } from '@/lib/types';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface NewCampaignClientProps {
  projects: Project[];
  templates: Template[];
  initialData?: Campaign;
}

export function NewCampaignClient({ projects, templates, initialData }: NewCampaignClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [campaignId, setCampaignId] = React.useState(initialData?.id || null);
  const [campaignName, setCampaignName] = React.useState(initialData?.name || '');
  const [subject, setSubject] = React.useState(initialData?.subject || '');
  const [emailContent, setEmailContent] = React.useState(initialData?.htmlContent || '');
  const [csvContent, setCsvContent] = React.useState<string | null>(null);
  const [csvFileName, setCsvFileName] = React.useState<string | null>(null);
  
  const [isSending, setIsSending] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);

  const [selectedProjectId, setSelectedProjectId] = React.useState<string>(''); // TODO: Link this to campaign data
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>('');

  React.useEffect(() => {
    if (selectedTemplateId) {
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
      if (selectedTemplate) {
        setSubject(selectedTemplate.subject);
        setEmailContent(selectedTemplate.htmlContent);
      }
    }
  }, [selectedTemplateId, templates]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFileName(file.name);
      const reader = new FileReader();

      if (file.name.endsWith('.csv')) {
        reader.onload = (e) => {
          const text = e.target?.result;
          setCsvContent(text as string);
        };
        reader.readAsText(file);
      } else if (file.name.endsWith('.xlsx')) {
        reader.onload = (e) => {
          const data = e.target?.result;
          try {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            setCsvContent(csv);
          } catch (error) {
            console.error('Error parsing XLSX file:', error);
            toast({
              title: 'Error Parsing File',
              description: 'Could not parse the XLSX file. Please ensure it is valid.',
              variant: 'destructive',
            });
            setCsvFileName(null);
            setCsvContent(null);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        toast({
          title: 'Unsupported File Type',
          description: 'Please upload a .csv or .xlsx file.',
          variant: 'destructive',
        });
        setCsvFileName(null);
        setCsvContent(null);
      }
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignName || !subject || !emailContent || !csvContent) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all fields and upload a contacts file to send.',
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
        fromEmail: 'no-reply@example.com',
      });

      if (result.success) {
        toast({
          title: 'Campaign Sent!',
          description: `${result.emailsSent} emails have been queued for sending.`,
        });
        router.push('/dashboard/campaigns');
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
  
  const handleSaveDraft = async () => {
    if (!campaignName) {
        toast({ title: 'Campaign Name Required', description: 'Please enter a name for your campaign to save a draft.', variant: 'destructive' });
        return;
    }
    
    setIsSavingDraft(true);
    try {
        await saveCampaign({
            id: campaignId || undefined,
            name: campaignName,
            subject,
            htmlContent: emailContent,
            status: 'Draft',
        });
        toast({ title: 'Draft Saved', description: 'Your campaign draft has been saved.' });
        router.push('/dashboard/campaigns?tab=draft');
        router.refresh();
    } catch (error) {
       console.error('Failed to save draft:', error);
       toast({
        title: 'Error',
        description: 'Could not save the draft. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingDraft(false);
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
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
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
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates && templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
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
              <Label htmlFor="contacts-file" className="block mb-2">Upload Contacts (CSV or XLSX)</Label>
              <div className="flex items-center justify-center w-full">
                  <label htmlFor="contacts-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2">
                          <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                           {csvFileName ? (
                              <p className="text-sm text-muted-foreground truncate">{csvFileName}</p>
                          ) : (
                              <>
                                  <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                  <p className="text-xs text-muted-foreground">CSV or XLSX file</p>
                              </>
                          )}
                      </div>
                      <Input id="contacts-file" type="file" className="hidden" accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" onChange={handleFileChange} />
                  </label>
              </div>
              {initialData?.recipients === 0 || !initialData && (
                <p className="text-xs text-muted-foreground mt-2">Upload a new contact list to send this campaign.</p>
              )}
            </div>
            
            <SuggestSendTimeClient emailContent={emailContent} />

          </CardContent>
        </Card>
        <Button size="lg" className="w-full" onClick={handleSendCampaign} disabled={isSending || isSavingDraft}>
          {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Send Campaign
        </Button>
        <div className="grid grid-cols-2 gap-4">
          <Button size="lg" variant="outline" className="w-full" onClick={handleSaveDraft} disabled={isSavingDraft || isSending}>
            {isSavingDraft ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {campaignId ? 'Update Draft' : 'Save as Draft'}
          </Button>
           <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="w-full" disabled={!emailContent.trim()}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Email Preview</DialogTitle>
                </DialogHeader>
                <div className="flex-1 border rounded-md overflow-hidden">
                  <iframe
                    srcDoc={emailContent}
                    className="w-full h-full border-none"
                    title="Email Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              </DialogContent>
            </Dialog>
        </div>
      </div>
    </div>
  );
}
