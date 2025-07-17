"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PageHeader } from "../../page-header";

export default function NewProjectPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    service: "sendgrid", // default selected service
    apiKey: "",
    fromEmail: "",
  });

  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await createProject(form);
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Create New Project"
        description="Set up a new project to manage campaigns and settings."
      />
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Enter the details for your new project below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="e.g., Q4 Product Launch"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A brief description of the project."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>


            <div className="space-y-2">
              <Label>Email Service Provider</Label>
              <Select

                value={form.service}

                onValueChange={(value) => setForm({ ...form, service: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="mailchimp">MailChimp</SelectItem>
                  <SelectItem value="brevo">Brevo (Sendinblue)</SelectItem>
                  <SelectItem value="klav">Klavio</SelectItem>
                  <SelectItem value="ses">Amazon SES</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">Enter the API Key</Label>
              <Input

                id="apiKey"

                type="password"

                placeholder={`API Key`}

                value={form.apiKey}

                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}

              />
            </div>



            <div className="space-y-2">
              <Label htmlFor="fromEmail">Project Email (From)</Label>
              <Input
                id="fromEmail"
                type="email"
                placeholder="e.g., hello@yourdomain.com"
                value={form.fromEmail}
                onChange={(e) =>
                  setForm({ ...form, fromEmail: e.target.value })
                }
              />
            </div>

            <Button type="submit">Create Project</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
