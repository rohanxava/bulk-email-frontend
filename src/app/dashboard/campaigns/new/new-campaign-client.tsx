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
import {
  Upload,
  Loader2,
  Eye,
  Save,
  Bold,
  Italic,
  Underline,
  List,
  Heading,
  Palette,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  sendCampaign,
  fetchProjectById,
  getTemplates,
  fetchProjects,
  getCampaignById,
  saveCampaign,
  getCurrentUser,
  generateTemplateWithAI,
  getContactLists
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
  const [attachmentFile, setAttachmentFile] = React.useState<File | null>(null);
  const [prompt, setPrompt] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [campaignName, setCampaignName] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [emailContent, setEmailContent] = React.useState("");
  const [rawText, setRawText] = React.useState("");
  const [csvContent, setCsvContent] = React.useState<string | null>(null);
  const [csvFileName, setCsvFileName] = React.useState<string | null>(null);
  const [parsedCsvRows, setParsedCsvRows] = React.useState<any[]>([]);
  const [manualEmails, setManualEmails] = React.useState<string>("");
  const [showFullContactDialog, setShowFullContactDialog] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("");
  const [userId, setUserId] = React.useState("");
  const [isHtmlMode, setIsHtmlMode] = React.useState(false);
  const [contactLists, setContactLists] = React.useState<any[]>([]);
  const [selectedListId, setSelectedListId] = React.useState<string>("");
  const [selectedListContacts, setSelectedListContacts] = React.useState<any[]>([]);
  const [showLinkInput, setShowLinkInput] = React.useState(false);
  const [linkURL, setLinkURL] = React.useState("");
  const [showFullCsvDialog, setShowFullCsvDialog] = React.useState(false);
  const [showFullContactListDialog, setShowFullContactListDialog] = React.useState(false);
  const [linkText, setLinkText] = React.useState("");

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

  const insertLink = () => {
    const textarea = rawTextRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const finalText = linkText || rawText.slice(start, end) || "Link";
    const linkTag = `<a href="${linkURL}" target="_blank">${finalText}</a>`;
    const updated = rawText.slice(0, start) + linkTag + rawText.slice(end);
    setRawText(updated);
    setShowLinkInput(false);
    setLinkURL("");
    setLinkText("");
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + linkTag.length, start + linkTag.length);
    }, 0);
  };

  const applyColor = (color: string) => wrapSelectedText(`<span style="color:${color}">`, "</span>");


  React.useEffect(() => {
    (async () => {
      try {
        const lists = await getContactLists();
        setContactLists(lists);
      } catch (err) {
        console.error("Error fetching contact lists:", err);
      }
    })();
  }, []);


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
    const t = templates.find((x) => x._id === selectedTemplateId);
    console.log("📄 Selected Template Details:", t); // <-- Console log added

    if (t) {
      setSubject(t.subject);
      setEmailContent(t.htmlContent);
      setRawText(t.htmlContent);
      setAttachmentFile(t.attachment);
    }
  }, [selectedTemplateId, templates]);

React.useEffect(() => {
  if (!campaignId || contactLists.length === 0) return;

  (async () => {
    const c = await getCampaignById(campaignId);
    setCampaignName(c.campaignName || "");
    setSubject(c.subject || "");
    setEmailContent(c.htmlContent || "");
    setRawText(c.htmlContent || "");
    setSelectedProjectId(c.projectId);
    setSelectedTemplateId(c.templateId);

    if (c.csvContent) {
      setCsvContent(c.csvContent);
      setCsvFileName("Previously uploaded CSV");
      const parsed = Papa.parse(c.csvContent, { header: true });
      setParsedCsvRows(parsed.data);
    }

    if (c.contacts && Array.isArray(c.contacts)) {
      // Use exactly the saved contacts to preserve FirstName/LastName
      setSelectedListContacts(c.contacts);

      // For manual emails, extract contacts that have only email (no name)
      const manualEmailsArray = c.contacts
        .filter(contact => !contact.firstName && !contact.lastName)
        .map(contact => contact.email);

      setManualEmails(manualEmailsArray.join(", "));
    }

  })();
}, [campaignId, contactLists]);


  const handleGenerateWithAI = async () => {
    if (!prompt.trim()) {
      return toast({ title: "Enter a prompt", description: "AI prompt cannot be empty.", variant: "destructive" });
    }
    setIsGenerating(true);
    try {
      const result = await generateTemplateWithAI(prompt);
      setSubject(result.subject);
      setEmailContent(result.htmlContent);
      setRawText(result.htmlContent);
      setIsHtmlMode(true);
      toast({ title: "AI Template Generated", description: "You can now edit the content." });
    } catch (err) {
      console.error(err);
      toast({ title: "AI Generation Failed", description: "Check console for details.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCsvFileName(f.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (!result) return;
      if (f.name.endsWith(".csv")) {
        setCsvContent(result as string);
        setParsedCsvRows(Papa.parse(result as string, { header: true }).data);
      } else {
        const wb = XLSX.read(result, { type: "array" });
        const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);
        setCsvContent(csv);
        setParsedCsvRows(Papa.parse(csv, { header: true }).data);
      }
    };
    f.name.endsWith(".csv") ? reader.readAsText(f) : reader.readAsArrayBuffer(f);
  };

  const handleSendCampaign = async () => {
    const content = isHtmlMode ? emailContent : rawText;

    if (!campaignName || !subject || !content) {
      return toast({
        title: "Missing Fields",
        description: "All fields required.",
        variant: "destructive",
      });
    }

    // Collect manual emails
    const manualList = manualEmails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));

    // Collect CSV emails
    const csvEmails = parsedCsvRows
      .map((r) => {
        const key = Object.keys(r).find((k) => k.toLowerCase() === "email");
        return key ? r[key]?.trim() : null;
      })
      .filter((e: any) => e && e.includes("@"));

    // Collect selected contact list emails
    const listEmails = selectedListContacts
      .map((c) => ({
        firstName: c.firstName?.trim(),
        lastName: c.lastName?.trim(),
        email: c.email?.trim(),
      }))
      .filter((contact) => contact.email && contact.email.includes("@"));


    // Merge all unique emails
    const allEmails = Array.from(new Set([...manualList, ...csvEmails, ...listEmails]));

    if (allEmails.length === 0) {
      return toast({
        title: "No Recipients",
        description: "Provide at least one recipient.",
        variant: "destructive",
      });
    }

    setIsSending(true);

    try {
      const proj = await fetchProjectById(selectedProjectId);
      const fromEmail = proj.fromEmail || "hello@xavaconnect.com";

      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("campaignName", campaignName);
      formData.append("htmlContent", content);
      formData.append("csvContent", csvContent || "");
      formData.append("manualEmails", allEmails.join(","));
      formData.append("fromEmail", fromEmail);
      formData.append("sendgridKey", proj.sendgridKey!);
      formData.append("createdBy", userId);
      formData.append("projectId", selectedProjectId);
      formData.append("templateId", selectedTemplateId);
      formData.append("listContacts", JSON.stringify(selectedListContacts));


      if (attachmentFile) {
        if (attachmentFile instanceof File) {
          formData.append("attachment", attachmentFile);
        } else if (typeof attachmentFile === "string") {
          const backendURL = "https://bulkmail.xavawebservices.com";
          // http://172.236.172.122:5000  http://localhost:5000
          const url = `${backendURL}${attachmentFile.startsWith("/") ? "" : "/"}${attachmentFile}`;

          // Fetch the file as blob
          const response = await fetch(url);
          const blob = await response.blob();

          // Get filename from the URL (or fallback to 'attachment.pdf')
          const fileName = attachmentFile.split("/").pop() || "attachment.pdf";

          // Convert blob to File object
          const fileFromTemplate = new File([blob], fileName, { type: blob.type });

          formData.append("attachment", fileFromTemplate);
        }
      }

      const result = await sendCampaign(formData);

      if (result.success) {
        toast({
          title: "Campaign Sent",
          description: `${result.emailsSent} emails sent successfully.`,
        });
        router.push("/dashboard/campaigns");
      } else {
        toast({
          title: "Failed",
          description: result.error,
          variant: "destructive",
        });
      }

    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Send failed. Check console.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = async () => {
    const content = isHtmlMode ? emailContent : rawText;
    if (!campaignName || !subject || !content) return toast({ title: "Missing Fields", description: "All fields required.", variant: "destructive" });
    setIsSavingDraft(true);
    try {
      await saveCampaign({
        _id: campaignId,
        campaignName,
        subject,
        htmlContent: content,
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


  const handleListSelection = (listId: string) => {
    setSelectedListId(listId);
    const list = contactLists.find((l) => l._id === listId);
    if (list) {
      setSelectedListContacts(list.contacts);
      console.log("📋 Selected List Contacts:", list.contacts); // <-- Add this here

    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Side */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader><CardTitle>Email Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={selectedProjectId} onValueChange={(v) => { setSelectedProjectId(v); setSelectedTemplateId(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
                  <SelectContent>{projects.map((p) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Template (Optional)</Label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                  <SelectContent>{templates.map((t) => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sender Email</Label>
              <p className="border rounded px-3 py-2 bg-muted text-sm">{selectedProject?.fromEmail || "N/A"}</p>
            </div>

            <div className="space-y-2"><Label>Campaign Name</Label><Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} /></div>

            <div className="p-4 border rounded-xl bg-gradient-to-br from-indigo-50 to-white shadow-md">
              <Label className="font-semibold text-indigo-700">✨ Generate Email with AI</Label>
              <Input
                placeholder="e.g., Write a festive discount campaign"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-2 mb-4"
              />
              <Button onClick={handleGenerateWithAI} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                {isGenerating ? "Generating..." : "Generate with AI"}
              </Button>
            </div>

            <div className="space-y-2"><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Email Content</Label>
                <Button variant="ghost" size="sm" onClick={() => {
                  if (!isHtmlMode) {
                    const converted = rawText.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => `<p>${l}</p>`).join("\n");
                    setEmailContent(converted);
                  }
                  setIsHtmlMode(!isHtmlMode);
                }}>
                  {isHtmlMode ? "Back to Text" : "Convert to HTML"}
                </Button>
              </div>

              {!isHtmlMode ? (
                <>
                  <div className="flex gap-2 flex-wrap mb-2">
                    <Button size="sm" title="Bold" onClick={() => wrapSelectedText("<b>", "</b>")}><Bold className="w-4 h-4" /></Button>
                    <Button size="sm" title="Italic" onClick={() => wrapSelectedText("<i>", "</i>")}><Italic className="w-4 h-4" /></Button>
                    <Button size="sm" title="Underline" onClick={() => wrapSelectedText("<u>", "</u>")}><Underline className="w-4 h-4" /></Button>
                    <Button size="sm" title="Heading" onClick={() => wrapSelectedText("<h3>", "</h3>")}><Heading className="w-4 h-4" /></Button>
                    <Button size="sm" title="Bullet List" onClick={insertBulletList}><List className="w-4 h-4" /></Button>
                    <Button size="sm" title="Insert Link" onClick={() => setShowLinkInput(!showLinkInput)}>🔗</Button>
                    <div className="flex items-center gap-1">
                      <Palette className="w-4 h-4 text-muted-foreground" />
                      {COLORS.map((c) => <button key={c} style={{ backgroundColor: c }} className="w-5 h-5 rounded-full border" title={c} onClick={() => applyColor(c)} />)}
                    </div>
                  </div>

                  {showLinkInput && (
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <Input placeholder="Enter URL" value={linkURL} onChange={(e) => setLinkURL(e.target.value)} />
                      <Input placeholder="Link text" value={linkText} onChange={(e) => setLinkText(e.target.value)} />
                      <Button onClick={insertLink} disabled={!linkURL}>Insert</Button>
                    </div>
                  )}

                  <textarea
                    ref={rawTextRef}
                    className="w-full min-h-[250px] border rounded p-2 font-mono"
                    placeholder="Write your message here..."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                  />
                </>
              ) : (
                <CodeMirror value={emailContent} height="250px" extensions={[html()]} onChange={setEmailContent} theme="light" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side */}
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="block mb-2">
                Upload Contacts (CSV/XLSX)
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                <span className="text-red-500">*</span> The file must contain an <strong>"Email"</strong> column (case-insensitive, no spaces(not even after the header)). Example header: <code>Email</code>
              </p>
              <label htmlFor="contacts-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                <Upload className="w-8 h-8 mb-3 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">{csvFileName || "Click to upload CSV or XLSX"}</p>
                <Input id="contacts-file" type="file" className="hidden" accept=".csv,.xlsx" onChange={handleFileChange} />
              </label>
            </div>


            <div className="space-y-2">
              <Label>Select Uploaded Contact List</Label>
              <Select value={selectedListId} onValueChange={handleListSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a contact list" />
                </SelectTrigger>
                <SelectContent>
                  {contactLists.map((list) => (
                    <SelectItem key={list._id} value={list._id}>
                      {list.name} ({list.contacts.length} contacts)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedListContacts.length > 0 && (
              <div className="overflow-x-auto max-h-64 border rounded-md mt-4">
                <table className="min-w-full text-sm text-left table-auto border-collapse">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-3 py-2 border-b font-semibold">First Name</th>
                      <th className="px-3 py-2 border-b font-semibold">Last Name</th>
                      <th className="px-3 py-2 border-b font-semibold">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedListContacts.slice(0, 10).map((contact, i) => (
                      <tr key={i} className="odd:bg-muted/30 even:bg-muted/10">
                        <td className="px-3 py-1 border-b">{contact.firstName || "-"}</td>
                        <td className="px-3 py-1 border-b">{contact.lastName || "-"}</td>
                        <td className="px-3 py-1 border-b">{contact.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs px-2 pt-1 text-muted-foreground">
                  Showing first 10 contacts from selected list.
                  <button
                    className="text-blue-500 underline ml-2"
                    onClick={() => setShowFullContactListDialog(true)}
                  >
                    View All
                  </button>
                </p>
              </div>
            )}

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

            <div className="space-y-2">
              <Label htmlFor="attachment">Attach PDF (optional)</Label>
              <Input
                id="attachment"
                type="file"
                accept="application/pdf"
                onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
              />
            </div>

            {attachmentFile && (
              <div className="flex flex-col items-center gap-2 mt-2">
                <p className="text-sm truncate text-center">
                  {attachmentFile instanceof File ? attachmentFile.name : attachmentFile.split("/").pop()}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (attachmentFile instanceof File) {
                      const url = URL.createObjectURL(attachmentFile);
                      window.open(url, "_blank");
                    } else if (typeof attachmentFile === "string") {
                      const backendURL = "https://bulkmail.xavawebservices.com";

                      // http://172.236.172.122:5000   http://localhost:5000
                      const url = `${backendURL}${attachmentFile.startsWith("/") ? "" : "/"}${attachmentFile}`;
                      window.open(url, "_blank");
                    } else {
                      alert("Attachment preview is not available.");
                    }
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Attachment
                </Button>
              </div>
            )}


            {parsedCsvRows.length > 0 && (
              <>
                <div className="overflow-x-auto max-h-64 border rounded-md">
                  <table className="min-w-full text-sm text-left table-auto border-collapse">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        {Object.keys(parsedCsvRows[0] || {}).map((k) => (
                          <th key={k} className="px-3 py-2 border-b font-semibold">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedCsvRows.slice(0, 10).map((r, i) => (
                        <tr key={i} className="odd:bg-muted/30 even:bg-muted/10">
                          {Object.values(r).map((v, j) => (
                            <td key={j} className="px-3 py-1 border-b">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs px-2 pt-1 text-muted-foreground">
                    Showing first 10 rows.
                    <button
                      className="text-blue-500 underline ml-2"
                      onClick={() => setShowFullCsvDialog(true)}
                    >
                      View All
                    </button>
                  </p>
                </div>


                <Dialog open={showFullContactListDialog} onOpenChange={setShowFullContactListDialog}>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>Full Contact List Preview</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-left table-auto border-collapse">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="px-3 py-2 border-b font-semibold">First Name</th>
                            <th className="px-3 py-2 border-b font-semibold">Last Name</th>
                            <th className="px-3 py-2 border-b font-semibold">Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedListContacts.map((contact, i) => (
                            <tr key={i} className="odd:bg-muted/30 even:bg-muted/10">
                              <td className="px-3 py-1 border-b">{contact.firstName || "-"}</td>
                              <td className="px-3 py-1 border-b">{contact.lastName || "-"}</td>
                              <td className="px-3 py-1 border-b">{contact.email}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </DialogContent>
                </Dialog>


                <Dialog open={showFullCsvDialog} onOpenChange={setShowFullCsvDialog}>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                    <DialogHeader><DialogTitle>Full CSV/XLSX Preview</DialogTitle></DialogHeader>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-left table-auto border-collapse">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            {Object.keys(parsedCsvRows[0] || {}).map((k) => (
                              <th key={k} className="px-3 py-2 border-b font-semibold">{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parsedCsvRows.map((r, i) => (
                            <tr key={i} className="odd:bg-muted/30 even:bg-muted/10">
                              {Object.values(r).map((v, j) => (
                                <td key={j} className="px-3 py-1 border-b">{v}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
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
