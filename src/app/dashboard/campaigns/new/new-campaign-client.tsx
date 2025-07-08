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
import { Upload, Loader2, Eye, Save, Bold, Italic, Underline, List, Heading, Palette } from "lucide-react";
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

import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";

interface NewCampaignClientProps {
  campaignId?: string;
}

const COLORS = [
  "#000000", "#FF0000", "#008000", "#0000FF", "#FFA500",
  "#800080", "#00CED1", "#FF69B4", "#A52A2A", "#808000",
];

export function NewCampaignClient({ campaignId }: NewCampaignClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const rawTextRef = React.useRef<HTMLTextAreaElement>(null);

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [initialData, setInitialData] = React.useState<Campaign | null>(null);

  const [campaignName, setCampaignName] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [emailContent, setEmailContent] = React.useState("");
  const [rawText, setRawText] = React.useState("");

  const [csvContent, setCsvContent] = React.useState<string | null>(null);
  const [csvFileName, setCsvFileName] = React.useState<string | null>(null);
  const [parsedCsvRows, setParsedCsvRows] = React.useState<any[]>([]);
  const [manualEmails, setManualEmails] = React.useState<string>("");

  const [isSending, setIsSending] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);

  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("");

  const [userId, setUserId] = React.useState("");
  const [isHtmlMode, setIsHtmlMode] = React.useState(false);

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  const wrapSelectedText = (startTag: string, endTag: string) => {
    const textarea = rawTextRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = rawText.slice(start, end);
    const updated = rawText.slice(0, start) + startTag + selected + endTag + rawText.slice(end);
    setRawText(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, end + startTag.length);
    }, 0);
  };

  const insertBulletList = () => {
    const lines = rawText.split("\n").map((line) => `<li>${line.trim()}</li>`);
    setRawText(`<ul>\n${lines.join("\n")}\n</ul>`);
  };

  const applyColor = (color: string) => {
    wrapSelectedText(`<span style="color:${color}">`, "</span>");
  };

  React.useEffect(() => {
    (async () => {
      const [user, proj] = await Promise.all([getCurrentUser(), fetchProjects()]);
      setUserId(user._id);
      setProjects(proj);
    })();
  }, []);

  React.useEffect(() => {
    if (!selectedProjectId) return setTemplates([]);
    (async () => {
      try {
        const tmpl = await getTemplates(selectedProjectId);
        setTemplates(tmpl);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    })();
  }, [selectedProjectId]);

  React.useEffect(() => {
    if (!selectedTemplateId) return;
    const template = templates.find((t) => t._id === selectedTemplateId);
    if (template) {
      setSubject(template.subject);
      setEmailContent(template.htmlContent);
      setRawText(template.htmlContent);
    }
  }, [selectedTemplateId, templates]);

  React.useEffect(() => {
    if (!campaignId) return;
    (async () => {
      const campaign = await getCampaignById(campaignId);
      setInitialData(campaign);
      setCampaignName(campaign.campaignName || "");
      setSubject(campaign.subject || "");
      setEmailContent(campaign.htmlContent || "");
      setRawText(campaign.htmlContent || "");
      setSelectedProjectId(campaign.projectId);
      setSelectedTemplateId(campaign.templateId);

      let emails = Array.isArray(campaign.manualEmails) ? [...campaign.manualEmails] : [];
      if (campaign.csvContent) {
        setCsvContent(campaign.csvContent);
        setCsvFileName("Previously uploaded CSV");
        const parsed = Papa.parse(campaign.csvContent, { header: true });
        setParsedCsvRows(parsed.data);
        const csvEmails = parsed.data
          .map((row: any) => {
            const key = Object.keys(row).find((k) => k.toLowerCase() === "email");
            return key ? row[key]?.trim() : null;
          })
          .filter((email: any) => email && email.includes("@"));
        emails = [...emails, ...csvEmails];
      }
      setManualEmails(emails.join(", "));
    })();
  }, [campaignId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) return;
      if (file.name.endsWith(".csv")) {
        const csv = result as string;
        setCsvContent(csv);
        setParsedCsvRows(Papa.parse(csv, { header: true }).data);
      } else {
        const wb = XLSX.read(result, { type: "array" });
        const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);
        setCsvContent(csv);
        setParsedCsvRows(Papa.parse(csv, { header: true }).data);
      }
    };

    if (file.name.endsWith(".csv")) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  };

  const handleSendCampaign = async () => {
    const contentToSend = isHtmlMode ? emailContent : rawText;
    if (!campaignName || !subject || !contentToSend)
      return toast({ title: "Missing Fields", description: "All fields required.", variant: "destructive" });

    const manualList = manualEmails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.includes("@"));

    const csvEmails = parsedCsvRows
      .map((row) => {
        const key = Object.keys(row).find((k) => k.toLowerCase() === "email");
        return key ? row[key]?.trim() : null;
      })
      .filter((email: any) => email && email.includes("@"));

    const uniqueEmails = Array.from(new Set([...manualList, ...csvEmails]));
    if (uniqueEmails.length === 0)
      return toast({ title: "No Recipients", description: "Provide recipients.", variant: "destructive" });

    setIsSending(true);
    try {
      const project = await fetchProjectById(selectedProjectId);
      const fromEmail = project.fromEmail || "hello@xavaconnect.com";

      const result = await sendCampaign({
        subject,
        campaignName,
        htmlContent: contentToSend,
        csvContent: "",
        manualEmails: uniqueEmails,
        fromEmail,
        sendgridKey: project.sendgridKey!,
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
    const contentToSave = isHtmlMode ? emailContent : rawText;
    if (!campaignName || !subject || !contentToSave) {
      return toast({ title: "Missing Fields", description: "All fields required.", variant: "destructive" });
    }

    setIsSavingDraft(true);
    try {
      await saveCampaign({
        _id: campaignId,
        campaignName,
        subject,
        htmlContent: contentToSave,
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
        <CardHeader>
          <CardTitle>Email Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select
                value={selectedProjectId}
                onValueChange={(value) => {
                  setSelectedProjectId(value);
                  setSelectedTemplateId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
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
            <Label>Sender Email</Label>
            <p className="border rounded px-3 py-2 bg-muted text-sm">
              {selectedProject?.fromEmail || "N/A"}
            </p>
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
              <div className="flex justify-between items-center">
                <Label>Email Content</Label>
                <Button variant="ghost" size="sm" onClick={() => setIsHtmlMode(!isHtmlMode)}>
                  {isHtmlMode ? "Use Visual Mode" : "Use HTML Mode"}
                </Button>
              </div>

              {!isHtmlMode ? (
                <>
                  <div className="flex gap-2 flex-wrap mb-2">
                    <Button size="sm" onClick={() => wrapSelectedText("<b>", "</b>")}><Bold /></Button>
                    <Button size="sm" onClick={() => wrapSelectedText("<i>", "</i>")}><Italic /></Button>
                    <Button size="sm" onClick={() => wrapSelectedText("<u>", "</u>")}><Underline /></Button>
<Button size="sm" onClick={() => wrapSelectedText("<h3>", "</h3>")}>
  <Heading />
</Button>
                    <Button size="sm" onClick={insertBulletList}><List /></Button>
                    <div className="flex items-center gap-1">
                      <Palette />
                      {COLORS.map(c => (
                        <button
                          key={c}
                          className="w-5 h-5 rounded-full border"
                          style={{ backgroundColor: c }}
                          onClick={() => applyColor(c)}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                  <textarea
                    ref={rawTextRef}
                    className="w-full min-h-[250px] border rounded p-2 font-mono"
                    placeholder="Write your message here..."
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                  />
                </>
              ) : (
                <CodeMirror
                  value={emailContent}
                  height="250px"
                  extensions={[html()]}
                  onChange={setEmailContent}
                  theme="light"
                />
              )}
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
            <Label className="block mb-2">Upload Contacts (CSV/XLSX)</Label>
            <label
              htmlFor="contacts-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
            >
              <div className="text-center px-2">
                <Upload className="w-8 h-8 mb-3 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {csvFileName ? csvFileName : "Click to upload CSV or XLSX"}
                </p>
              </div>
              <Input
                id="contacts-file"
                type="file"
                className="hidden"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-emails">Add Email(s) Manually</Label>
            <textarea
              id="manual-emails"
              className="w-full p-2 border rounded min-h-[100px]"
              placeholder="Enter comma-separated emails"
              value={manualEmails}
              onChange={(e) => setManualEmails(e.target.value)}
            />
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
