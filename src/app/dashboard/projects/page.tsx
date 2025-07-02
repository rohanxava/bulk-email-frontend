"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchProjects, deleteProject } from "../../../services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Settings, Trash2 } from "lucide-react";
import { PageHeader } from "../page-header";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load projects", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProject(deleteId);
      setDeleteId(null);
      loadProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage your projects and their SendGrid API keys."
      >
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </PageHeader>

      {loading ? (
        <p className="text-muted-foreground px-4">Loading projects...</p>
      ) : projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                  {project.name}
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <Link href={`/dashboard/projects/${project._id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(project._id)}
                    className="hover:bg-red-100 group"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {project.description}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        project.sendgridKey ? "bg-green-500" : "bg-destructive"
                      }`}
                    ></span>
                    <p className="text-xs text-muted-foreground">
                      {project.sendgridKey
                        ? "SendGrid API Key Linked"
                        : "API Key Required"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No projects found. Create one to get started!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Confirm Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this project? This action cannot be
            undone.
          </p>
          <DialogFooter className="pt-4">
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
