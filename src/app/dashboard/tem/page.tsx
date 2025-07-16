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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "../page-header";
import { getTemplates, deleteTemplate } from "@/services/api";

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [templateToDelete, setTemplateToDelete] = useState<any | null>(null);
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

    const confirmDelete = async () => {
        if (!templateToDelete) return;
        try {
            await deleteTemplate(templateToDelete._id);
            setTemplates((prev) => prev.filter((tpl) => tpl._id !== templateToDelete._id));
            setTemplateToDelete(null);
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
                    <Link href="/dashboard/tem/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Template
                    </Link>
                </Button>
            </PageHeader>

            {templates.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {templates.map((template) => (
                        <Card key={template._id} className="relative">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{template.name}</CardTitle>
                                        <CardDescription>{template.subject}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/dashboard/tem/${template._id}/edit`}>
                                            <Button variant="ghost" size="icon">
                                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </Link>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => setTemplateToDelete(template)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Confirm Delete</DialogTitle>
                                                </DialogHeader>
                                                <p className="text-sm text-muted-foreground">
                                                    Are you sure you want to delete <strong>{template.name}</strong>?
                                                </p>
                                                <div className="flex justify-end mt-4 gap-2">
                                                    <Button variant="outline" onClick={() => setTemplateToDelete(null)}>
                                                        Cancel
                                                    </Button>
                                                    <Button variant="destructive" onClick={confirmDelete}>
                                                        Delete
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
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
