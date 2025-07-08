"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import type { Project, Template } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Eye } from "lucide-react";
import { getTemplateById, updateTemplate } from "@/services/api";

interface EditTemplateClientProps {
    templateId: string;
    projects: Project[];
}

export function EditTemplateClient({ templateId, projects }: EditTemplateClientProps) {
    const [projectId, setProjectId] = React.useState("");
    const [templateName, setTemplateName] = React.useState("");
    const [subject, setSubject] = React.useState("");
    const [htmlContent, setHtmlContent] = React.useState("");
    const { toast } = useToast();
    const router = useRouter();

    // Load template details
    React.useEffect(() => {
        const loadTemplate = async () => {
            try {
                const template: Template = await getTemplateById(templateId);
                setProjectId(template.projectId);
                setTemplateName(template.name);
                setSubject(template.subject);
                setHtmlContent(template.htmlContent);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load template data.",
                    variant: "destructive",
                });
            }
        };

        loadTemplate();
    }, [templateId]);

    const handleUpdateTemplate = async () => {
        if (!projectId || !templateName || !subject || !htmlContent) {
            toast({
                title: "Missing Fields",
                description: "Please fill all fields before saving.",
                variant: "destructive",
            });
            return;
        }

        try {
            await updateTemplate(templateId, {
                name: templateName,
                subject,
                htmlContent,
                projectId,
            });

            toast({
                title: "Template Updated",
                description: "Your template has been updated successfully.",
            });

            router.push("/dashboard/templates");
        } catch (error) {
            console.error("Failed to update template", error);
            toast({
                title: "Error",
                description: "Failed to update template.",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Template</CardTitle>
                <CardDescription>Modify your existing email template below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="project">Project</Label>
                        <Select value={projectId} onValueChange={setProjectId}>
                            <SelectTrigger id="project">
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
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input
                            id="template-name"
                            placeholder="e.g., Monthly Newsletter"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                        id="subject"
                        placeholder="e.g., Your monthly news from us!"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email-content">HTML Content</Label>
                    <Textarea
                        id="email-content"
                        placeholder="Use {{variable}} for personalization."
                        className="min-h-[300px] font-mono"
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={handleUpdateTemplate}>Update Template</Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" disabled={!htmlContent.trim()}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>HTML Preview</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 border rounded-md overflow-hidden">
                                <iframe
                                    srcDoc={htmlContent}
                                    className="w-full h-full border-none"
                                    title="HTML Preview"
                                    sandbox="allow-scripts"
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
}
