'use client';
import { useEffect, useState } from 'react';
import { PageHeader } from '../../page-header';
import { NewTemplateClient } from './new-template-client';
import { fetchProjects } from '@/services/api';
import type { Project } from '@/lib/types';

export default function NewTemplatePage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchProjects();
      setProjects(data);
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Create New Template" description="Design a reusable email template for your campaigns." />
      <NewTemplateClient projects={projects} />
    </div>
  );
}
