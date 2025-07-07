"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Papa from "papaparse";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, Eye, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  sendCampaign,
  fetchProjectById,
  getTemplates,
  fetchProjects,
  getCampaignById,
  saveCampaign,
  getCurrentUser,
} from "@/services/api";
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
  campaignId?: string;
}

export function NewCampaignClient({ campaignId }: NewCampaignClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [initialData, setInitialData] = React.useState<Campaign | null>(null);

  const [campaignName, setCampaignName] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [emailContent, setEmailContent] = React.useState("");
  const [csvContent, setCsvContent] = React.useState<string | null>(null);
  const [csvFileName, setCsvFileName] = React.useState<string | null>(null);
  const [parsedCsvRows, setParsedCsvRows] = React.useState<any[]>([]);
  const [manualEmails, setManualEmails] = React.useState<string>("");

  const [isSending, setIsSending] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);

  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("");
  const [fromEmailChoice, setFromEmailChoice] = React.useState("project");

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  React.useEffect(() => {
    const fetchAll = async () => {
      try {
        const [proj, tmpl] = await Promise.all([fetchProjects(), getTemplates()]);
        setProjects(proj);
        setTemplates(tmpl);

        if (campaignId) {
          const campaign = await getCampaignById(campaignId);
          setInitialData(campaign);

          setCampaignName(campaign.campaignName || "");
          setSubject(campaign.subject || "");
          setEmailContent(campaign.htmlContent || "");

          let allEmails: string[] = [];

          if (Array.isArray(campaign.manualEmails)) {
            allEmails = [...campaign.manualEmails];
          }

          if (campaign.csvContent) {
            setCsvContent(campaign.csvContent);
            setCsvFileName("Previously uploaded CSV");

            try {
              const parsed = Papa.parse(campaign.csvContent, {
                header: true,
                skipEmptyLines: true,
              });
              setParsedCsvRows(parsed.data);

              const emailsFromCSV = parsed.data
                .map((contact: any) => {
                  const emailKey = Object.keys(contact).find((key) =>
                    key.toLowerCase() === "email"
                  );
                  return emailKey ? contact[emailKey]?.trim() : null;
                })
                .filter((email: any) => email && email.includes("@"));

              allEmails = [...allEmails, ...emailsFromCSV];
            } catch (e) {
              console.error("❌ Failed to parse stored CSV content", e);
            }
          }

          setManualEmails(allEmails.join(", "));

          if (proj.some((p) => p._id === campaign.projectId)) {
            setSelectedProjectId(campaign.projectId);
          }
          if (tmpl.some((t) => t._id === campaign.templateId)) {
            setSelectedTemplateId(campaign.templateId);
          }
        }
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    };

    fetchAll();
  }, [campaignId]);

  React.useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find((t) => t._id === selectedTemplateId);
      if (template) {
        setSubject(template.subject);
        setEmailContent(template.htmlContent);
      }
    }
  }, [selectedTemplateId, templates]);

  const [userId, setUserId] = React.useState("");
  React.useEffect(() => {
    getCurrentUser().then((user) => {
      setUserId(user._id);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);

    const reader = new FileReader();
    if (file.name.endsWith(".csv")) {
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        setCsvContent(csv);
        const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
        setParsedCsvRows(parsed.data);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith(".xlsx")) {
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result, { type: "array" });
          const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);
          setCsvContent(csv);
          const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
          setParsedCsvRows(parsed.data);
        } catch {
          toast({ title: "Error", description: "Could not parse XLSX file.", variant: "destructive" });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast({ title: "Unsupported File", description: "Upload CSV or XLSX.", variant: "destructive" });
      setCsvFileName(null);
      setCsvContent(null);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignName || !subject || !emailContent) {
      return toast({ title: "Missing Fields", description: "All fields required.", variant: "destructive" });
    }

    const manualList = manualEmails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.includes("@"));

    const emailsFromCsv = parsedCsvRows
      .map((row) => {
        const emailKey = Object.keys(row).find((key) => key.toLowerCase() === "email");
        return emailKey ? row[emailKey]?.trim() : null;
      })
      .filter((email) => email && email.includes("@"));

    const uniqueEmails = Array.from(new Set([...manualList, ...emailsFromCsv]));

    if (uniqueEmails.length === 0) {
      return toast({ title: "No Recipients", description: "Provide recipients.", variant: "destructive" });
    }

    setIsSending(true);
    try {
      const project = await fetchProjectById(selectedProjectId);
      if (!project.sendgridKey) throw new Error("Missing SendGrid key");

      const fromEmail = fromEmailChoice === "project"
        ? project.fromEmail || "hello@xavaconnect.com"
        : "hello@xavaconnect.com";

      const result = await sendCampaign({
        subject,
        campaignName,
        htmlContent: emailContent,
        csvContent: "",
        manualEmails: uniqueEmails,
        fromEmail,
        sendgridKey: project.sendgridKey,
        createdBy: userId,
        projectId: selectedProjectId,
        templateId: selectedTemplateId,
      });

      if (result.success) {
        toast({ title: "Campaign Sent", description: `${result.emailsSent} emails sent.` });
        router.push("/dashboard/campaigns");
      } else {
        toast({ title: "Failed", description: result.error, variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Send failed. Check console.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!campaignName || !subject || !emailContent) {
      return toast({ title: "Missing Fields", description: "All fields required.", variant: "destructive" });
    }

    setIsSavingDraft(true);
    try {
      await saveCampaign({
        _id: campaignId,
        campaignName,
        subject,
        htmlContent: emailContent,
        csvContent: csvContent ?? "",
        manualEmails,
        projectId: selectedProjectId,
        templateId: selectedTemplateId,
        status: "Draft",
        createdBy: userId,
      });
      toast({ title: "Draft saved" });
      router.push("/dashboard/campaigns");
    } catch (err: any) {
      toast({ title: "Save Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSavingDraft(false);
    }
  };

  
return (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div className="md:col-span-2 space-y-6">
      <Card>
        <CardHeader><CardTitle>Email Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Template (Optional)</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template._id} value={template._id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email Sender</Label>
            <Select value={fromEmailChoice} onValueChange={setFromEmailChoice}>
              <SelectTrigger><SelectValue placeholder="Choose sender email" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Project Email ({selectedProject?.fromEmail || "N/A"})</SelectItem>
                <SelectItem value="default">Default Email (hello@xavaconnect.com)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Campaign Name</Label>
            <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Email Content</Label>
            <Textarea className="min-h-[250px]" value={emailContent} onChange={(e) => setEmailContent(e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="manual-emails">Add Email(s) Manually</Label>
            <Textarea id="manual-emails" placeholder="Enter comma-separated emails" value={manualEmails} onChange={(e) => setManualEmails(e.target.value)} />
          </div>

          {parsedCsvRows.length > 0 && (
            <div className="overflow-x-auto max-h-64 border rounded-md">
              <table className="min-w-full text-sm text-left table-auto border-collapse">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    {Object.keys(parsedCsvRows[0] || {}).map((key) => (
                      <th key={key} className="px-3 py-2 border-b font-semibold">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedCsvRows.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="odd:bg-muted/30 even:bg-muted/10">
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="px-3 py-1 border-b">{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs px-2 pt-1 text-muted-foreground">Showing first 10 rows.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button size="lg" className="w-full" onClick={handleSendCampaign} disabled={isSending}>
        {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send Campaign
      </Button>

      <div className="grid grid-cols-2 gap-4">
        <Button size="lg" variant="outline" className="w-full" onClick={handleSaveDraft} disabled={isSavingDraft}>
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
              <iframe srcDoc={emailContent} className="w-full h-full border-none" title="Email Preview" sandbox="allow-scripts" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </div>
);


}
