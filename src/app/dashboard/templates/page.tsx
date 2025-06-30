import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { PageHeader } from '../page-header';

const templates = [
  { name: 'Welcome Email', category: 'Onboarding', lastUpdated: '2024-07-18' },
  { name: 'Product Promotion', category: 'Marketing', lastUpdated: '2024-07-12' },
  { name: 'Feature Update', category: 'Announcements', lastUpdated: '2024-07-05' },
  { name: 'Password Reset', category: 'Transactional', lastUpdated: '2024-06-28' },
];

export default function TemplatesPage() {
  return (
    <div>
      <PageHeader
        title="Email Templates"
        description="Create and manage reusable email templates."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {templates.map((template, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Last updated: {template.lastUpdated}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
