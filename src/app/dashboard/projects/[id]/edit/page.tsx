"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchProjectById, updateProject } from "../../../../../services/api";
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
import { PageHeader } from "../../../page-header";

export default function EditProjectPage() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    description: "",
    service: "sendgrid", // default to sendgrid
    apiKey: "",
    fromEmail: "",
  });

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const data = await fetchProjectById(id as string);
      setForm({
        name: data.name || "",
        description: data.description || "",
        service: data.service || "sendgrid",
        apiKey: data.apiKey || "",
        fromEmail: data.fromEmail || "",
      });

    };
    load();
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await updateProject(id as string, form);
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Edit Project"
        description="Modify your project's name, description, or SendGrid API key."
      />
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Update the details for your project below.
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
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
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
                placeholder={` API Key`}
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                placeholder="123@gmail.com"
                value={form.fromEmail}
                onChange={(e) =>
                  setForm({ ...form, fromEmail: e.target.value })
                }
              />
            </div>



            <Button type="submit">Update Project</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



