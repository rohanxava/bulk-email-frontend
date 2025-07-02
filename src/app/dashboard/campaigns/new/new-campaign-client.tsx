// NewCampaignClient.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, Eye, Save } from "lucide-react";
import { SuggestSendTimeClient } from "./suggest-send-time-client";
import { useToast } from "@/hooks/use-toast";
import { sendCampaign } from "@/ai/flows/send-campaign";
import { saveCampaign } from "@/services/api";
import type { Project, Template, Campaign } from "@/lib/types";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface NewCampaignClientProps {
  projects: Project[];
  templates: Template[];
  initialData?: Campaign;
}

export function NewCampaignClient({
  projects,
  templates,
  initialData,
}: NewCampaignClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [campaignId, setCampaignId] = React.useState(initialData?.id || null);
  const [campaignName, setCampaignName] = React.useState(initialData?.name || "");
  const [subject, setSubject] = React.useState(initialData?.subject || "");
  const [emailContent, setEmailContent] = React.useState(initialData?.htmlContent || "");
  const [csvContent, setCsvContent] = React.useState<string | null>(null);
  const [csvFileName, setCsvFileName] = React.useState<string | null>(null);
  const [manualEmails, setManualEmails] = React.useState<string>("");

  const [isSending, setIsSending] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);

  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("");

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
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();

    if (file.name.endsWith(".csv")) {
      reader.onload = (e) => setCsvContent(e.target?.result as string);
      reader.readAsText(file);
    } else if (file.name.endsWith(".xlsx")) {
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target?.result, { type: "array" });
          const sheet = workbook.SheetNames[0];
          const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheet]);
          setCsvContent(csv);
        } catch {
          toast({
            title: "Error",
            description: "Could not parse XLSX file.",
            variant: "destructive",
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast({
        title: "Unsupported File Type",
        description: "Please upload a .csv or .xlsx file.",
        variant: "destructive",
      });
      setCsvFileName(null);
      setCsvContent(null);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignName || !subject || !emailContent) {
      toast({
        title: "Missing Fields",
        description: "Campaign name, subject, and content are required.",
        variant: "destructive",
      });
      return;
    }

    const manualList = manualEmails
      .split(",")
      .map(email => email.trim())
      .filter(email => email.includes("@"));

    if (!csvContent && manualList.length === 0) {
      toast({
        title: "No Recipients",
        description: "Upload a contact file or enter email addresses.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const result = await sendCampaign({
        subject,
        htmlContent: emailContent,
        csvContent,
        manualEmails: manualList,
        fromEmail: "no-reply@example.com",
      });

      if (result.success) {
        toast({ title: "Campaign Sent", description: `${result.emailsSent} emails sent.` });
        router.push("/dashboard/campaigns");
      } else {
        toast({ title: "Failed", description: result.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Check console.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader><CardTitle>Email Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Project and Template Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger id="project"><SelectValue placeholder="Select a project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project._id} value={project._id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template">Template (Optional)</Label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger id="template"><SelectValue placeholder="Select a template" /></SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Campaign Name</Label>
              <Input value={campaignName} onChange={e => setCampaignName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email Content</Label>
              <Textarea className="min-h-[250px]" value={emailContent} onChange={e => setEmailContent(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div>
              <Label className="block mb-2">Upload Contacts (CSV/XLSX)</Label>
              <label htmlFor="contacts-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                <div className="text-center px-2">
                  <Upload className="w-8 h-8 mb-3 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    {csvFileName ? csvFileName : "Click to upload CSV or XLSX"}
                  </p>
                </div>
                <Input id="contacts-file" type="file" className="hidden" accept=".csv,.xlsx" onChange={handleFileChange} />
              </label>
            </div>

            {/* Manual Email Input */}
            <div className="space-y-2">
              <Label htmlFor="manual-emails">Add Email(s) Manually</Label>
              <Textarea
                id="manual-emails"
                placeholder="Enter comma-separated email addresses"
                value={manualEmails}
                onChange={(e) => setManualEmails(e.target.value)}
              />
            </div>

            <SuggestSendTimeClient emailContent={emailContent} />
          </CardContent>
        </Card>

        <Button size="lg" className="w-full" onClick={handleSendCampaign} disabled={isSending}>
          {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Send Campaign
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <Button size="lg" variant="outline" className="w-full" onClick={() => {}}>
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="w-full" disabled={!emailContent.trim()}>
                <Eye className="mr-2 h-4 w-4" /> Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
              <DialogHeader><DialogTitle>Email Preview</DialogTitle></DialogHeader>
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