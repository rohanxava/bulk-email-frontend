// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { fetchProjectById, updateProject } from "../../../../../services/api";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";

// export default function EditProjectPage() {
//   const { id } = useParams();
//   const [form, setForm] = useState({ name: "", description: "", sendgridKey: "" });
//   const router = useRouter();

//   useEffect(() => {
//     const load = async () => {
//       const data = await fetchProjectById(id as string);
//       setForm({
//         name: data.name || "",
//         description: data.description || "",
//         sendgridKey: data.sendgridKey || "",
//       });
//     };
//     load();
//   }, [id]);

//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
//     await updateProject(id as string, form);
//     router.push("/dashboard/projects");
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4 p-4">
//       <h2 className="text-xl font-semibold">Edit Project</h2>
//       <Input
//         placeholder="Project Name"
//         value={form.name}
//         onChange={(e) => setForm({ ...form, name: e.target.value })}
//       />
//       <Textarea
//         placeholder="Description"
//         value={form.description}
//         onChange={(e) => setForm({ ...form, description: e.target.value })}
//       />
//       <Input
//         placeholder="SendGrid API Key"
//         value={form.sendgridKey}
//         onChange={(e) => setForm({ ...form, sendgridKey: e.target.value })}
//       />
//       <Button type="submit">Update</Button>
//     </form>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchProjectById, updateProject } from "../../../../../services/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
    sendgridKey: "",
    fromEmail: "",
  });
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const data = await fetchProjectById(id as string);
      setForm({
        name: data.name || "",
        description: data.description || "",
        sendgridKey: data.sendgridKey || "",
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
              <Label htmlFor="sendgridKey">SendGrid API Key</Label>
              <Input
                id="sendgridKey"
                type="password"
                placeholder="Your SendGrid API Key"
                value={form.sendgridKey}
                onChange={(e) =>
                  setForm({ ...form, sendgridKey: e.target.value })
                }
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



