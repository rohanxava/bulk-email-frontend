"use client";

import * as React from "react";
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
import type { Project } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Eye } from "lucide-react";
import { createTemplate } from "@/services/api";

interface NewTemplateClientProps {
  projects: Project[];
}

export function NewTemplateClient({ projects }: NewTemplateClientProps) {
  const [projectId, setProjectId] = React.useState("");
  const [templateName, setTemplateName] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [htmlContent, setHtmlContent] = React.useState("");
  const { toast } = useToast();

  const handleSaveTemplate = async () => {
    if (!projectId || !templateName || !subject || !htmlContent) {
      toast({
        title: "Missing Fields",
        description: "Please fill all fields before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTemplate({
        name: templateName,
        subject,
        htmlContent,
        projectId,
      });

      toast({
        title: "Template Saved",
        description: "Your new template has been saved successfully.",
      });

      // Optional: redirect or clear fields
    } catch (error) {
      console.error("Failed to save template", error);
      toast({
        title: "Error",
        description: "Failed to save template.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>
            Fill in the details for your new email template.
          </CardDescription>
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
                  {projects &&
                    projects.map((project) => (
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
              placeholder="Use {{variable}} for personalization. Example: <html><body><p>Hello {{firstName}},</p></body></html>"
              className="min-h-[300px] font-mono"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSaveTemplate}>Save Template</Button>
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
    </>
  );
}
