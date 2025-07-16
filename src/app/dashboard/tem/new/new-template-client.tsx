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
import {
  Eye,
  Bold,
  Italic,
  Underline,
  Heading,
  List,
  Palette,
} from "lucide-react";
import type { Project } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { createTemplate, fetchProjects, getCurrentUser } from "@/services/api";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";

export function NewTemplateClient() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [userId, setUserId] = React.useState("");

  const [projectId, setProjectId] = React.useState("");
  const [templateName, setTemplateName] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [htmlContent, setHtmlContent] = React.useState("");
  const [rawText, setRawText] = React.useState("");
  const [isHtmlMode, setIsHtmlMode] = React.useState(false);
  const rawTextRef = React.useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const [showLinkInput, setShowLinkInput] = React.useState(false);
  const [linkURL, setLinkURL] = React.useState("");
  const [linkText, setLinkText] = React.useState("");

  const colorOptions = [
    "#000000",
    "#FF0000",
    "#008000",
    "#0000FF",
    "#FFA500",
    "#800080",
    "#808080",
    "#008080",
  ];

  // Fetch projects and user info (role-based access)
  React.useEffect(() => {
    (async () => {
      try {
        const [user, proj] = await Promise.all([
          getCurrentUser(),
          fetchProjects(),
        ]);
        setUserId(user._id);
        setProjects(proj);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to fetch projects",
          variant: "destructive",
        });
      }
    })();
  }, []);

  const handleSaveTemplate = async () => {
    const contentToSave = isHtmlMode ? htmlContent : rawText;
    if (!projectId || !templateName || !subject || !contentToSave) {
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
        htmlContent: contentToSave,
        projectId,
      });

      toast({
        title: "Template Saved",
        description: "Your new template has been saved successfully.",
      });

      // Clear form after save (optional)
      setTemplateName("");
      setSubject("");
      setRawText("");
      setHtmlContent("");
      setIsHtmlMode(false);
    } catch (error) {
      console.error("Failed to save template", error);
      toast({
        title: "Error",
        description: "Failed to save template.",
        variant: "destructive",
      });
    }
  };

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
    const lines = rawText
      .split("\n")
      .map((line) => `<li>${line.trim()}</li>`)
      .join("\n");
    const wrapped = `<ul>\n${lines}\n</ul>`;
    setRawText(wrapped);
  };

  const insertLink = () => {
    const textarea = rawTextRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = rawText.slice(start, end);
    const before = rawText.slice(0, start);
    const after = rawText.slice(end);

    const finalText = linkText || selected || "Link";
    const linkTag = `<a href="${linkURL}" target="_blank">${finalText}</a>`;
    const newText = before + linkTag + after;

    setRawText(newText);
    setShowLinkInput(false);
    setLinkURL("");
    setLinkText("");

    setTimeout(() => {
      textarea.focus();
      const newStart = start + linkTag.length;
      textarea.setSelectionRange(newStart, newStart);
    }, 0);
  };

  return (
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
          <div className="flex justify-between items-center">
            <Label>Email Content</Label>
            {!isHtmlMode ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const converted = rawText
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0)
                    .map((line) => `<p>${line}</p>`)
                    .join("\n");
                  setHtmlContent(converted);
                  setIsHtmlMode(true);
                }}
              >
                Convert to HTML
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsHtmlMode(false)}
              >
                Back to Text
              </Button>
            )}
          </div>

          {!isHtmlMode ? (
            <>
              <div className="flex gap-2 flex-wrap mb-2">
                <Button
                  size="sm"
                  title="Bold"
                  onClick={() => wrapSelectedText("<b>", "</b>")}
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  title="Italic"
                  onClick={() => wrapSelectedText("<i>", "</i>")}
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  title="Underline"
                  onClick={() => wrapSelectedText("<u>", "</u>")}
                >
                  <Underline className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  title="Heading"
                  onClick={() => wrapSelectedText("<h3>", "</h3>")}
                >
                  <Heading className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  title="Bullet List"
                  onClick={insertBulletList}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  title="Insert Link"
                  onClick={() => setShowLinkInput(!showLinkInput)}
                >
                  🔗
                </Button>
                <div className="flex items-center gap-1">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      style={{ backgroundColor: color }}
                      className="w-5 h-5 rounded-full border"
                      title={color}
                      onClick={() =>
                        wrapSelectedText(
                          `<span style="color: ${color}">`,
                          "</span>"
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              {showLinkInput && (
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <Input
                    placeholder="Enter URL"
                    value={linkURL}
                    onChange={(e) => setLinkURL(e.target.value)}
                  />
                  <Input
                    placeholder="Link text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                  />
                  <Button onClick={insertLink} disabled={!linkURL}>
                    Insert
                  </Button>
                </div>
              )}

              <textarea
                ref={rawTextRef}
                className="w-full min-h-[300px] border rounded p-2 font-mono"
                placeholder="Write your message here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </>
          ) : (
            <CodeMirror
              value={htmlContent}
              height="300px"
              extensions={[html()]}
              onChange={(value) => setHtmlContent(value)}
              theme="light"
            />
          )}
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
  );
}
