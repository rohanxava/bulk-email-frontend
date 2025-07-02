// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { PageHeader } from '../../page-header';
// import { Textarea } from '@/components/ui/textarea';

// export default function NewProjectPage() {
//   return (
//     <div className="max-w-2xl mx-auto">
//       <PageHeader
//         title="Create New Project"
//         description="Set up a new project to manage campaigns and settings."
//       />
//       <Card>
//         <CardHeader>
//           <CardTitle>Project Details</CardTitle>
//           <CardDescription>
//             Enter the details for your new project below.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="project-name">Project Name</Label>
//             <Input id="project-name" placeholder="e.g., Q4 Product Launch" />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="project-description">Description</Label>
//             <Textarea
//               id="project-description"
//               placeholder="A brief description of the project."
//             />
//           </div>
//            <div className="space-y-2">
//             <Label htmlFor="sendgrid-key">SendGrid API Key</Label>
//             <Input id="sendgrid-key" type="password" placeholder="Your SendGrid API Key" />
//           </div>
//           <Button>Create Project</Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { createProject } from "../../../../services/api";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";

// export default function NewProjectPage() {
//   const [form, setForm] = useState({ name: "", description: "", sendgridKey: "" });
//   const router = useRouter();

//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
//     await createProject(form);
//     router.push("/dashboard/projects");
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4 p-4">
//       <h2 className="text-xl font-semibold">Create Project</h2>
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
//       <Button type="submit">Create</Button>
//     </form>
//   );
// }


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/services/api";
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
import { PageHeader } from "../../page-header";

export default function NewProjectPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    sendgridKey: "",
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

            <Button type="submit">Create Project</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
