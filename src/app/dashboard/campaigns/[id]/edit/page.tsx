import { fetchProjects, getTemplates, getCampaignById } from '@/services/api';
import { PageHeader } from '../../../page-header';
import NewCampaignClient from '../../new/new-campaign-client'; 

export default async function EditCampaignPage({ params }: { params: { id: string } }) {
  const projects = await fetchProjects();
  const templates = await getTemplates();
  const campaign = await getCampaignById(params.id);

  if (!campaign) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Edit Campaign"
        description="Modify your campaign details and content."
      />
      <NewCampaignClient
        projects={projects}
        templates={templates}
        initialData={campaign}
      />
    </div>
  );
}
