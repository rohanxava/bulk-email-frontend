'use client';

import { useEffect, useState } from 'react';
import { fetchProjects, getTemplates } from '@/services/api';
import { PageHeader } from '../../page-header';
import { NewCampaignClient } from './new-campaign-client';
import type { Project, Template } from '@/lib/types';

export default function NewCampaignPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projData, tmplData] = await Promise.all([
          fetchProjects(),
          getTemplates(),
        ]);
        setProjects(projData);
        setTemplates(tmplData);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

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
