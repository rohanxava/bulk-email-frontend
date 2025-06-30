
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '../../page-header';
import { Textarea } from '@/components/ui/textarea';

export default function NewProjectPage() {
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input id="project-name" placeholder="e.g., Q4 Product Launch" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              placeholder="A brief description of the project."
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="sendgrid-key">SendGrid API Key</Label>
            <Input id="sendgrid-key" type="password" placeholder="Your SendGrid API Key" />
          </div>
          <Button>Create Project</Button>
        </CardContent>
      </Card>
    </div>
  );
}
