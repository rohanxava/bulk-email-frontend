
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '../../page-header';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProjects } from '@/services/api';
import type { Project } from '@/lib/types';

export default async function NewTemplatePage() {
  const projects: Project[] = await getProjects();

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Create New Template"
        description="Design a reusable email template for your campaigns."
      />
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
              <Select>
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects && projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input id="template-name" placeholder="e.g., Monthly Newsletter" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input id="subject" placeholder="e.g., Your monthly news from us!" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-content">HTML Content</Label>
            <Textarea
              id="email-content"
              placeholder="Use {{variable}} for personalization. Example: <html><body><p>Hello {{firstName}},</p></body></html>"
              className="min-h-[300px] font-mono"
            />
          </div>
          <Button>Save Template</Button>
        </CardContent>
      </Card>
    </div>
  );
}
