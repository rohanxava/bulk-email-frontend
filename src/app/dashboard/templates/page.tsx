
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { PageHeader } from '../page-header';
import { getTemplates } from '@/services/api';
import { format } from 'date-fns';

export default async function TemplatesPage() {
  const templates = await getTemplates();

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
       {templates && templates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Last updated: {format(new Date(template.lastUpdated), 'PPP')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No templates found. Create one to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
