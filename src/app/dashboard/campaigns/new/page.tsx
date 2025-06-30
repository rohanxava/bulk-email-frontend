
import { getProjects, getTemplates } from '@/services/api';
import { PageHeader } from '../../page-header';
import { NewCampaignClient } from './new-campaign-client';
import type { Project, Template } from '@/lib/types';

export default async function NewCampaignPage() {
  const projects: Project[] = await getProjects();
  const templates: Template[] = await getTemplates();

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Create New Campaign"
        description="Set up your email, upload contacts, and send your campaign."
      />
      <NewCampaignClient projects={projects} templates={templates} />
    </div>
  );
}
