import { mockProjects, mockUsers, mockTemplates, mockCampaigns } from './mock-data';
import type { Project, User, Template, Campaign } from '@/lib/types';

// Simulate a network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getProjects(): Promise<Project[]> {
  await delay(200);
  return mockProjects;
}

export async function getUsers(): Promise<User[]> {
  await delay(200);
  return mockUsers;
}

export async function getUserById(id: string): Promise<User | undefined> {
  await delay(200);
  return mockUsers.find(user => user.id === id);
}

export async function getTemplates(): Promise<Template[]> {
  await delay(200);
  return mockTemplates;
}

export async function getCampaigns(): Promise<Campaign[]> {
  await delay(200);
  return mockCampaigns;
}


export async function getCampaignById(id: string): Promise<Campaign | undefined> {
  await delay(200);
  return mockCampaigns.find(campaign => campaign.id === id);
}

export async function saveCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
  await delay(300);
  const user = mockUsers[0]; // mock current user
  
  if (campaignData.id) {
    // Update existing campaign
    const index = mockCampaigns.findIndex(c => c.id === campaignData.id);
    if (index !== -1) {
      const updatedCampaign = { ...mockCampaigns[index], ...campaignData };
      mockCampaigns[index] = updatedCampaign as Campaign;
      return updatedCampaign as Campaign;
    }
  }

  // Create new campaign
  const newCampaign: Campaign = {
    id: `camp_${new Date().getTime()}`,
    name: campaignData.name || 'Untitled Campaign',
    status: campaignData.status || 'Draft',
    recipients: 0,
    createdBy: user.name,
    createdDate: new Date().toISOString(),
    subject: campaignData.subject || '',
    htmlContent: campaignData.htmlContent || '',
  };
  mockCampaigns.unshift(newCampaign); // Add to the beginning of the list
  return newCampaign;
}
