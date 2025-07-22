"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getTemplateById, updateTemplate, fetchProjects } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function EditTemplatePage() {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const [projects, setProjects] = useState<any[]>([]);
    const [form, setForm] = useState({
        projectId: "",
        name: "",
        subject: "",
        htmlContent: "",
        attachment: "",
    });

    useEffect(() => {
        const loadData = async () => {
            console.log("Fetching template with id:", id);

            try {
                const template = await getTemplateById(id as string);
                console.log("Template fetched:", template);

                const projectList = await fetchProjects();
                console.log("Projects fetched:", projectList);

                setProjects(projectList);

                setForm({
                    projectId: template.projectId,
                    name: template.name,
                    subject: template.subject,
                    htmlContent: template.htmlContent,
                    attachment: template.attachment || "",
                });


                console.log("Form state set to:", {
                    projectId: template.projectId,
                    name: template.name,
                    subject: template.subject,
                    htmlContent: template.htmlContent,
                });

            } catch (error) {
                console.error("Failed to load template or projects", error);
                toast({
                    title: "Error",
                    description: "Failed to load template data.",
                    variant: "destructive",
                });
            }
        };

        loadData();
    }, [id]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('subject', form.subject);
        formData.append('htmlContent', form.htmlContent);
        formData.append('projectId', form.projectId);

        if (form.newAttachment) {
            formData.append('attachment', form.newAttachment);
        }

        try {
            await updateTemplate(id, formData); // Make sure `updateTemplate` accepts FormData now

            toast({
                title: "Template Updated",
                description: "Your template has been updated successfully.",
            });

            router.push("/dashboard/tem");
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
        <div className="max-w-2xl mx-auto">
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Edit Template</CardTitle>
                    <CardDescription>Modify your existing email template below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="project">Project</Label>
                            <Select
                                value={form.projectId}
                                onValueChange={(value) => setForm({ ...form, projectId: value })}
                            >
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
                            <Label htmlFor="name">Template Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Monthly Newsletter"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                placeholder="Subject of the email"
                                value={form.subject}
                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="htmlContent">HTML Content</Label>
                            <Textarea
                                id="htmlContent"
                                placeholder="HTML content here..."
                                className="min-h-[300px] font-mono"
                                value={form.htmlContent}
                                onChange={(e) => setForm({ ...form, htmlContent: e.target.value })}
                            />
                        </div>
                        {form.attachment && (
                            <div className="space-y-2">
                                <Label>Current Attachment (PDF)</Label>
                                <div className="mt-2">
                                    <a
                                        href={`https://bulkmail.xavawebservices.com${form.attachment}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-1 py-1 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
                                    >
                                        📄 View PDF Attachment
                                    </a>
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Update Attachment (optional)</Label>
                            <Input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => setForm({ ...form, newAttachment: e.target.files?.[0] })}
                            />
                        </div>
                        <Button type="submit">Update Template</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
