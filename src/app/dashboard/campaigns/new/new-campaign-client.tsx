// "use client";

// import * as React from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import Papa from "papaparse";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Upload, Loader2, Eye, Save } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import {
//   sendCampaign,
//   fetchProjectById,
//   getTemplates,
//   fetchProjects,
//   getCampaignById,
//   saveCampaign,
//   getCurrentUser,
// } from "@/services/api";
// import type { Project, Template, Campaign } from "@/lib/types";
// import * as XLSX from "xlsx";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";

// interface NewCampaignClientProps {
//   campaignId?: string;
// }

// export function NewCampaignClient({ campaignId }: NewCampaignClientProps) {
//   const router = useRouter();
//   const { toast } = useToast();

//   const [projects, setProjects] = React.useState<Project[]>([]);
//   const [templates, setTemplates] = React.useState<Template[]>([]);
//   const [initialData, setInitialData] = React.useState<Campaign | null>(null);

//   const [campaignName, setCampaignName] = React.useState("");
//   const [subject, setSubject] = React.useState("");
//   const [emailContent, setEmailContent] = React.useState("");
//   const [csvContent, setCsvContent] = React.useState<string | null>(null);
//   const [csvFileName, setCsvFileName] = React.useState<string | null>(null);
//   const [parsedCsvRows, setParsedCsvRows] = React.useState<any[]>([]);
//   const [manualEmails, setManualEmails] = React.useState<string>("");

//   const [isSending, setIsSending] = React.useState(false);
//   const [isSavingDraft, setIsSavingDraft] = React.useState(false);

//   const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");
//   const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("");

//   const [userId, setUserId] = React.useState("");

//   const selectedProject = projects.find((p) => p._id === selectedProjectId);

//   React.useEffect(() => {
//     const fetchUserAndProjects = async () => {
//       const [user, proj] = await Promise.all([getCurrentUser(), fetchProjects()]);
//       setUserId(user._id);
//       setProjects(proj);
//     };

//     fetchUserAndProjects();
//   }, []);

//   React.useEffect(() => {
//     const fetchTemplatesForProject = async () => {
//       if (!selectedProjectId) {
//         setTemplates([]);
//         return;
//       }
//       try {
//         const tmpl = await getTemplates(selectedProjectId);
//         setTemplates(tmpl);
//       } catch (err: any) {
//         toast({ title: "Error", description: err.message, variant: "destructive" });
//       }
//     };

//     fetchTemplatesForProject();
//   }, [selectedProjectId]);

//   React.useEffect(() => {
//     if (selectedTemplateId) {
//       const template = templates.find((t) => t._id === selectedTemplateId);
//       if (template) {
//         setSubject(template.subject);
//         setEmailContent(template.htmlContent);
//       }
//     }
//   }, [selectedTemplateId, templates]);

//   React.useEffect(() => {
//     const fetchCampaign = async () => {
//       if (!campaignId) return;
//       const campaign = await getCampaignById(campaignId);
//       setInitialData(campaign);

//       setCampaignName(campaign.campaignName || "");
//       setSubject(campaign.subject || "");
//       setEmailContent(campaign.htmlContent || "");

//       let allEmails: string[] = [];

//       if (Array.isArray(campaign.manualEmails)) {
//         allEmails = [...campaign.manualEmails];
//       }

//       if (campaign.csvContent) {
//         setCsvContent(campaign.csvContent);
//         setCsvFileName("Previously uploaded CSV");

//         const parsed = Papa.parse(campaign.csvContent, { header: true, skipEmptyLines: true });
//         setParsedCsvRows(parsed.data);

//         const emailsFromCSV = parsed.data
//           .map((contact: any) => {
//             const emailKey = Object.keys(contact).find((key) => key.toLowerCase() === "email");
//             return emailKey ? contact[emailKey]?.trim() : null;
//           })
//           .filter((email: any) => email && email.includes("@"));

//         allEmails = [...allEmails, ...emailsFromCSV];
//       }

//       setManualEmails(allEmails.join(", "));

//       setSelectedProjectId(campaign.projectId);
//       setSelectedTemplateId(campaign.templateId);
//     };

//     fetchCampaign();
//   }, [campaignId]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setCsvFileName(file.name);

//     const reader = new FileReader();
//     if (file.name.endsWith(".csv")) {
//       reader.onload = (e) => {
//         const csv = e.target?.result as string;
//         setCsvContent(csv);
//         const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
//         setParsedCsvRows(parsed.data);
//       };
//       reader.readAsText(file);
//     } else if (file.name.endsWith(".xlsx")) {
//       reader.onload = (e) => {
//         const wb = XLSX.read(e.target?.result, { type: "array" });
//         const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);
//         setCsvContent(csv);
//         const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
//         setParsedCsvRows(parsed.data);
//       };
//       reader.readAsArrayBuffer(file);
//     } else {
//       toast({ title: "Unsupported File", description: "Upload CSV or XLSX.", variant: "destructive" });
//       setCsvFileName(null);
//       setCsvContent(null);
//     }
//   };

//   const handleSendCampaign = async () => {
//     if (!campaignName || !subject || !emailContent) {
//       return toast({ title: "Missing Fields", description: "All fields required.", variant: "destructive" });
//     }

//     const manualList = manualEmails
//       .split(",")
//       .map((email) => email.trim())
//       .filter((email) => email.includes("@"));

//     const emailsFromCsv = parsedCsvRows
//       .map((row) => {
//         const emailKey = Object.keys(row).find((key) => key.toLowerCase() === "email");
//         return emailKey ? row[emailKey]?.trim() : null;
//       })
//       .filter((email) => email && email.includes("@"));

//     const uniqueEmails = Array.from(new Set([...manualList, ...emailsFromCsv]));

//     if (uniqueEmails.length === 0) {
//       return toast({ title: "No Recipients", description: "Provide recipients.", variant: "destructive" });
//     }

//     setIsSending(true);
//     try {
//       const project = await fetchProjectById(selectedProjectId);
//       if (!project.sendgridKey) throw new Error("Missing SendGrid key");

//       const fromEmail = project.fromEmail || "hello@xavaconnect.com";

//       const result = await sendCampaign({
//         subject,
//         campaignName,
//         htmlContent: emailContent,
//         csvContent: "",
//         manualEmails: uniqueEmails,
//         fromEmail,
//         sendgridKey: project.sendgridKey,
//         createdBy: userId,
//         projectId: selectedProjectId,
//         templateId: selectedTemplateId,
//       });

//       if (result.success) {
//         toast({ title: "Campaign Sent", description: `${result.emailsSent} emails sent.` });
//         router.push("/dashboard/campaigns");
//       } else {
//         toast({ title: "Failed", description: result.error, variant: "destructive" });
//       }
//     } catch (err) {
//       console.error(err);
//       toast({ title: "Error", description: "Send failed. Check console.", variant: "destructive" });
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleSaveDraft = async () => {
//     if (!campaignName || !subject || !emailContent) {
//       return toast({ title: "Missing Fields", description: "All fields required.", variant: "destructive" });
//     }

//     setIsSavingDraft(true);
//     try {
//       await saveCampaign({
//         _id: campaignId,
//         campaignName,
//         subject,
//         htmlContent: emailContent,
//         csvContent: csvContent ?? "",
//         manualEmails,
//         projectId: selectedProjectId,
//         templateId: selectedTemplateId,
//         status: "Draft",
//         createdBy: userId,
//       });
//       toast({ title: "Draft saved" });
//       router.push("/dashboard/campaigns");
//     } catch (err: any) {
//       toast({ title: "Save Failed", description: err.message, variant: "destructive" });
//     } finally {
//       setIsSavingDraft(false);
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//       <div className="md:col-span-2 space-y-6">
//         <Card>
//           <CardHeader><CardTitle>Email Details</CardTitle></CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label>Project</Label>
//                 <Select value={selectedProjectId} onValueChange={(value) => {
//                   setSelectedProjectId(value);
//                   setSelectedTemplateId("");
//                 }}>
//                   <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
//                   <SelectContent>
//                     {projects.map((project) => (
//                       <SelectItem key={project._id} value={project._id}>
//                         {project.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label>Template (Optional)</Label>
//                 <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
//                   <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
//                   <SelectContent>
//                     {templates.map((template) => (
//                       <SelectItem key={template._id} value={template._id}>
//                         {template.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label>Sender Email</Label>
//               <p className="border rounded px-3 py-2 bg-muted text-sm">
//                 {selectedProject?.fromEmail || "N/A"}
//               </p>
//             </div>

//             <div className="space-y-2">
//               <Label>Campaign Name</Label>
//               <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
//             </div>

//             <div className="space-y-2">
//               <Label>Subject</Label>
//               <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
//             </div>

//             <div className="space-y-2">
//               <Label>Email Content</Label>
//               <Textarea className="min-h-[250px]" value={emailContent} onChange={(e) => setEmailContent(e.target.value)} />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="space-y-6">
//         <Card>
//           <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label className="block mb-2">Upload Contacts (CSV/XLSX)</Label>
//               <label htmlFor="contacts-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
//                 <div className="text-center px-2">
//                   <Upload className="w-8 h-8 mb-3 text-muted-foreground mx-auto" />
//                   <p className="text-sm text-muted-foreground">
//                     {csvFileName ? csvFileName : "Click to upload CSV or XLSX"}
//                   </p>
//                 </div>
//                 <Input id="contacts-file" type="file" className="hidden" accept=".csv,.xlsx" onChange={handleFileChange} />
//               </label>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="manual-emails">Add Email(s) Manually</Label>
//               <Textarea id="manual-emails" placeholder="Enter comma-separated emails" value={manualEmails} onChange={(e) => setManualEmails(e.target.value)} />
//             </div>

//             {parsedCsvRows.length > 0 && (
//               <div className="overflow-x-auto max-h-64 border rounded-md">
//                 <table className="min-w-full text-sm text-left table-auto border-collapse">
//                   <thead className="bg-muted sticky top-0">
//                     <tr>
//                       {Object.keys(parsedCsvRows[0] || {}).map((key) => (
//                         <th key={key} className="px-3 py-2 border-b font-semibold">{key}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {parsedCsvRows.slice(0, 10).map((row, idx) => (
//                       <tr key={idx} className="odd:bg-muted/30 even:bg-muted/10">
//                         {Object.values(row).map((value, i) => (
//                           <td key={i} className="px-3 py-1 border-b">{value}</td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                 <p className="text-xs px-2 pt-1 text-muted-foreground">Showing first 10 rows.</p>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         <Button size="lg" className="w-full" onClick={handleSendCampaign} disabled={isSending}>
//           {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send Campaign
//         </Button>

//         <div className="grid grid-cols-2 gap-4">
//           <Button size="lg" variant="outline" className="w-full" onClick={handleSaveDraft} disabled={isSavingDraft}>
//             <Save className="mr-2 h-4 w-4" /> Save Draft
//           </Button>

//           <Dialog>
//             <DialogTrigger asChild>
//               <Button size="lg" variant="outline" className="w-full" disabled={!emailContent.trim()}>
//                 <Eye className="mr-2 h-4 w-4" /> Preview
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
//               <DialogHeader><DialogTitle>Email Preview</DialogTitle></DialogHeader>
//               <div className="flex-1 border rounded-md overflow-hidden">
//                 <iframe srcDoc={emailContent} className="w-full h-full border-none" title="Email Preview" sandbox="allow-scripts" />
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>
//     </div>
//   );
// }


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

import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";

interface NewCampaignClientProps {
  campaignId?: string;
}

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
    const selectedText = rawText.slice(start, end);
    const before = rawText.slice(0, start);
    const after = rawText.slice(end);
    const newText = before + startTag + selectedText + endTag + after;

    setRawText(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, end + startTag.length);
    }, 0);
  };

  const insertBulletList = () => {
    const lines = rawText.split("\n").map((line) => `<li>${line.trim()}</li>`);
    const wrapped = `<ul>\n${lines.join("\n")}\n</ul>`;
    setRawText(wrapped);
  };

  React.useEffect(() => {
    const fetchUserAndProjects = async () => {
      const [user, proj] = await Promise.all([getCurrentUser(), fetchProjects()]);
      setUserId(user._id);
      setProjects(proj);
    };
    fetchUserAndProjects();
  }, []);

  React.useEffect(() => {
    const fetchTemplates = async () => {
      if (!selectedProjectId) return setTemplates([]);
      try {
        const tmpl = await getTemplates(selectedProjectId);
        setTemplates(tmpl);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    };
    fetchTemplates();
  }, [selectedProjectId]);

  React.useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find((t) => t._id === selectedTemplateId);
      if (template) {
        setSubject(template.subject);
        setEmailContent(template.htmlContent);
        setRawText(template.htmlContent);
      }
    }
  }, [selectedTemplateId, templates]);

  React.useEffect(() => {
    if (!campaignId) return;
    const fetchCampaign = async () => {
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
        const parsed = Papa.parse(campaign.csvContent, { header: true, skipEmptyLines: true });
        setParsedCsvRows(parsed.data);
        const emailsFromCSV = parsed.data
          .map((row: any) => {
            const emailKey = Object.keys(row).find((key) => key.toLowerCase() === "email");
            return emailKey ? row[emailKey]?.trim() : null;
          })
          .filter((email: any) => email && email.includes("@"));
        emails = [...emails, ...emailsFromCSV];
      }

      setManualEmails(emails.join(", "));
    };
    fetchCampaign();
  }, [campaignId]);

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
        const wb = XLSX.read(e.target?.result, { type: "array" });
        const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);
        setCsvContent(csv);
        const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
        setParsedCsvRows(parsed.data);
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast({ title: "Unsupported File", description: "Upload CSV or XLSX.", variant: "destructive" });
      setCsvFileName(null);
      setCsvContent(null);
    }
  };

  const handleSendCampaign = async () => {
    const contentToSend = isHtmlMode ? emailContent : rawText;
    if (!campaignName || !subject || !contentToSend) {
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

      const fromEmail = project.fromEmail || "hello@xavaconnect.com";

      const result = await sendCampaign({
        subject,
        campaignName,
        htmlContent: contentToSend,
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
            <div className="flex justify-between items-center mt-4">
              <Label>Email Content</Label>
              <Button variant="ghost" size="sm" onClick={() => setIsHtmlMode((prev) => !prev)}>
                {isHtmlMode ? "Use Visual Editor" : "Use HTML Editor"}
              </Button>
            </div>

            {!isHtmlMode && (
              <>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Button size="sm" variant="outline" onClick={() => wrapSelectedText("<b>", "</b>")}>Bold</Button>
                  <Button size="sm" variant="outline" onClick={() => wrapSelectedText("<i>", "</i>")}>Italic</Button>
                  <Button size="sm" variant="outline" onClick={() => wrapSelectedText("<u>", "</u>")}>Underline</Button>
                  <Button size="sm" variant="outline" onClick={() => wrapSelectedText("<h1>", "</h1>")}>H1</Button>
                  <Button size="sm" variant="outline" onClick={() => wrapSelectedText("<h2>", "</h2>")}>H2</Button>
                  <Button size="sm" variant="outline" onClick={() => wrapSelectedText("<h3>", "</h3>")}>H3</Button>
                  <Button size="sm" variant="outline" onClick={insertBulletList}>• List</Button>
                </div>
                <textarea
                  ref={rawTextRef}
                  placeholder="Write your message here..."
                  className="w-full min-h-[250px] border p-2 rounded"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
              </>
            )}

            {isHtmlMode && (
              <CodeMirror
                value={emailContent}
                height="250px"
                extensions={[html()]}
                onChange={(value) => setEmailContent(value)}
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
