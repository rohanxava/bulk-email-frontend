// "use client";

// import * as React from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Upload, Loader2, Eye, Save } from "lucide-react";
// import { SuggestSendTimeClient } from "./suggest-send-time-client";
// import { useToast } from "@/hooks/use-toast";
// import { sendCampaign, fetchProjectById, getTemplates, fetchProjects, getCampaignById, saveCampaign, getCurrentUser } from '@/services/api';
// import type { Project, Template, Campaign } from "@/lib/types";
// import * as XLSX from "xlsx";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { create } from "domain";

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
//   const [manualEmails, setManualEmails] = React.useState<string>("");

//   const [isSending, setIsSending] = React.useState(false);
//   const [isSavingDraft, setIsSavingDraft] = React.useState(false);

//   const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");
//   const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("");

//   const selectedProject = projects.find((p) => p._id === selectedProjectId);

//   React.useEffect(() => {
//   const fetchAll = async () => {
//     try {
//       const [proj, tmpl] = await Promise.all([
//         fetchProjects(),
//         getTemplates()
//       ]);

//       console.log("✅ Fetched Projects:", proj);
//       console.log("✅ Fetched Templates:", tmpl);

//       setProjects(proj);
//       setTemplates(tmpl);

//       if (campaignId) {
//         const campaign = await getCampaignById(campaignId);
//         console.log("📦 Loaded Campaign:", campaign);

//         setInitialData(campaign);
//         setCampaignName(campaign.campaignName || '');
//         setSubject(campaign.subject || '');
//         setEmailContent(campaign.htmlContent || '');
//         setManualEmails(campaign.manualEmails || '');

//         const projectExists = proj.some(p => p._id === campaign.projectId);
//         const templateExists = tmpl.some(t => t._id === campaign.templateId);

//         console.log("🔍 projectId in campaign:", campaign.projectId);
//         console.log("🔍 templateId in campaign:", campaign.templateId);
//         console.log("📋 Available project IDs:", proj.map(p => p._id));
//         console.log("📋 Available template IDs:", tmpl.map(t => t._id));
//         console.log("✅ Project Exists?", projectExists);
//         console.log("✅ Template Exists?", templateExists);

//         if (projectExists) setSelectedProjectId(campaign.projectId);
//         if (templateExists) setSelectedTemplateId(campaign.templateId);
//       }

//     } catch (err: any) {
//       console.error("❌ Error loading campaign or resources:", err);
//       toast({
//         title: 'Error loading campaign',
//         description: err.message,
//         variant: 'destructive'
//       });
//     }
//   };

//   fetchAll();
// }, [campaignId]);



//   React.useEffect(() => {
//     if (selectedTemplateId) {
//       const selectedTemplate = templates.find((t) => t._id === selectedTemplateId);
//       if (selectedTemplate) {
//         setSubject(selectedTemplate.subject);
//         setEmailContent(selectedTemplate.htmlContent);
//       }
//     }
//   }, [selectedTemplateId, templates]);


//   const [userId, setUserId] = React.useState("");

//   React.useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const user = await getCurrentUser();
//         // console.log("user",user)
//         setUserId(user._id);
//       } catch (err) {
//         console.error("Failed to load user", err);
//         toast({
//           title: "User Fetch Failed",
//           description: "Cannot load current user.",
//           variant: "destructive",
//         });
//       }
//     };

//     fetchUser();
//   }, []);


//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     setCsvFileName(file.name);
//     const reader = new FileReader();

//     if (file.name.endsWith(".csv")) {
//       reader.onload = (e) => setCsvContent(e.target?.result as string);
//       reader.readAsText(file);
//     } else if (file.name.endsWith(".xlsx")) {
//       reader.onload = (e) => {
//         try {
//           const workbook = XLSX.read(e.target?.result, { type: "array" });
//           const sheet = workbook.SheetNames[0];
//           const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheet]);
//           setCsvContent(csv);
//         } catch {
//           toast({
//             title: "Error",
//             description: "Could not parse XLSX file.",
//             variant: "destructive",
//           });
//         }
//       };
//       reader.readAsArrayBuffer(file);
//     } else {
//       toast({
//         title: "Unsupported File Type",
//         description: "Please upload a .csv or .xlsx file.",
//         variant: "destructive",
//       });
//       setCsvFileName(null);
//       setCsvContent(null);
//     }
//   };

//   const handleSendCampaign = async () => {
//     if (!campaignName || !subject || !emailContent) {
//       toast({ title: "Missing Fields", description: "All fields required.", variant: "destructive" });
//       return;
//     }
//     const manualList = Array.isArray(manualEmails)
//   ? manualEmails
//   : manualEmails
//       .split(",")
//       .map((email) => email.trim())
//       .filter((email) => email.includes("@"));


//     if (!csvContent && manualList.length === 0) {
//       toast({ title: "No Recipients", description: "Provide recipients.", variant: "destructive" });
//       return;
//     }

//     setIsSending(true);
//     try {
//       const project = await fetchProjectById(selectedProjectId);
//       if (!project.sendgridKey) throw new Error("Missing SendGrid credentials");

//       const result = await sendCampaign({
//   subject,
//   campaignName,
//   htmlContent: emailContent,
//   csvContent: csvContent ?? "",
//   manualEmails: manualList,
//   fromEmail: "hello@xavaconnect.com",
//   sendgridKey: project.sendgridKey,
//   createdBy: userId,
//   projectId: selectedProjectId,        
//   templateId: selectedTemplateId       
// });


//       if (result.success) {
//         toast({ title: "Campaign Sent", description: `${result.emailsSent} emails sent.` });
//         router.push("/dashboard/campaigns");
//       } else {
//         toast({ title: "Failed", description: result.error, variant: "destructive" });
//       }
//     } catch (err) {
//       console.error("sendCampaign error", err);
//       toast({ title: "Error", description: "Check console.", variant: "destructive" });
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleSaveDraft = async () => {
//     if (!campaignName || !subject || !emailContent) {
//       toast({ title: 'Missing Fields', description: 'Fill name, subject, content.', variant: 'destructive' });
//       return;
//     }

//     setIsSavingDraft(true);
//     try {
//       await saveCampaign({
//   _id: campaignId,
//   campaignName,
//   subject,
//   htmlContent: emailContent,
//   csvContent: csvContent ?? '',
//   manualEmails,
//   projectId: selectedProjectId,        
//   templateId: selectedTemplateId,      
//   status: 'Draft',
//   createdBy: userId,
// });


//       toast({ title: 'Draft saved' });
//       router.push('/dashboard/campaigns');
//     } catch (err: any) {
//       toast({ title: 'Save Failed', description: err.message, variant: 'destructive' });
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
//                 <Label htmlFor="project">Project</Label>
//                 <Select
//   value={selectedProjectId || ""}
//   onValueChange={setSelectedProjectId}
// >
//   <SelectTrigger>
//     <SelectValue placeholder="Select a project" />
//   </SelectTrigger>
//   <SelectContent>
//     {projects.map((project) => (
//       <SelectItem key={project._id} value={project._id}>
//         {project.name}
//       </SelectItem>
//     ))}
//   </SelectContent>
// </Select>

//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="template">Template (Optional)</Label>
//                 <Select
//   value={selectedTemplateId || ""}
//   onValueChange={setSelectedTemplateId}
// >
//   <SelectTrigger>
//     <SelectValue placeholder="Select a template" />
//   </SelectTrigger>
//   <SelectContent>
//     {templates.map((template) => (
//       <SelectItem key={template._id} value={template._id}>
//         {template.name}
//       </SelectItem>
//     ))}
//   </SelectContent>
// </Select>

//               </div>
//             </div>
//             <div className="space-y-2">
//               <Label>Campaign Name</Label>
//               <Input value={campaignName} onChange={e => setCampaignName(e.target.value)} />
//             </div>
//             <div className="space-y-2">
//               <Label>Subject</Label>
//               <Input value={subject} onChange={e => setSubject(e.target.value)} />
//             </div>
//             <div className="space-y-2">
//               <Label>Email Content</Label>
//               <Textarea className="min-h-[250px]" value={emailContent} onChange={e => setEmailContent(e.target.value)} />
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
//               <Textarea id="manual-emails" placeholder="Enter comma-separated emails" value={manualEmails} onChange={e => setManualEmails(e.target.value)} />
//             </div>

//             <SuggestSendTimeClient emailContent={emailContent} />
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
          setManualEmails(campaign.manualEmails || "");
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
      reader.onload = (e) => setCsvContent(e.target?.result as string);
      reader.readAsText(file);
    } else if (file.name.endsWith(".xlsx")) {
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result, { type: "array" });
          const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);
          setCsvContent(csv);
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

    if (!csvContent && manualList.length === 0) {
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
        csvContent: csvContent ?? "",
        manualEmails: manualList,
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

            <SuggestSendTimeClient emailContent={emailContent} />
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
