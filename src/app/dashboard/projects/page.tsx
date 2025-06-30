import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Settings } from 'lucide-react';
import { PageHeader } from '../page-header';

const projects = [
  { name: 'Alpha Campaign', description: 'Lead generation for Q3', apiKeySet: true },
  { name: 'Beta Launch Promo', description: 'Initial user acquisition', apiKeySet: true },
  { name: 'Client Newsletter', description: 'Monthly updates for existing clients', apiKeySet: false },
  { name: 'Holiday Sale 2024', description: 'E-commerce promotion', apiKeySet: true },
];

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage your projects and their SendGrid API keys."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">{project.name}</CardTitle>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
              <div className="flex items-center space-x-2">
                <span className={`h-2 w-2 rounded-full ${project.apiKeySet ? 'bg-accent' : 'bg-destructive'}`}></span>
                <p className="text-xs text-muted-foreground">
                  {project.apiKeySet ? 'SendGrid API Key Linked' : 'API Key Required'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
