
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
