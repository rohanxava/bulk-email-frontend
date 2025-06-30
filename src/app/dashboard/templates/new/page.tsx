
import { getProjects } from '@/services/api';
import type { Project } from '@/lib/types';
import { PageHeader } from '../../page-header';
import { NewTemplateClient } from './new-template-client';

export default async function NewTemplatePage() {
  const projects: Project[] = await getProjects();

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Create New Template"
        description="Design a reusable email template for your campaigns."
      />
      <NewTemplateClient projects={projects} />
    </div>
  );
}
