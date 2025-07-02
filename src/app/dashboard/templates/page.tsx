"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Pencil, Trash2, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "../page-header";
import { getTemplates, deleteTemplate } from "@/services/api";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (err) {
        console.error("Failed to load templates:", err);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this template?"
    );
    if (!confirm) return;

    try {
      await deleteTemplate(id);
      setTemplates((prev) => prev.filter((tpl: any) => tpl._id !== id));
    } catch (err) {
      console.error("Failed to delete template:", err);
    }
  };

  return (
    <div>
      <PageHeader
        title="Email Templates"
        description="Create and manage reusable email templates."
      >
        <Button asChild>
          <Link href="/dashboard/templates/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Template
          </Link>
        </Button>
      </PageHeader>

      {templates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {templates.map((template: any) => (
            <Card key={template._id} className="relative">
              <CardHeader>
                {/* Edit & Delete Icons in top-right */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      router.push(`/dashboard/templates/${template._id}/edit`)
                    }
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={() => handleDelete(template._id)}
                    className="bg-transparent hover:bg-red-100 p-3 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.subject}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Last updated: {format(new Date(template.updatedAt), "PPP")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No templates found. Create one to get started!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
