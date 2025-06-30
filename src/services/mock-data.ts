
import type { Project, User, Template, Campaign } from '@/lib/types';
import { subDays } from 'date-fns';

export const mockProjects: Project[] = [
  { id: 'proj_1', name: 'Alpha Campaign', description: 'Lead generation for Q3', apiKeySet: true },
  { id: 'proj_2', name: 'Beta Launch Promo', description: 'Initial user acquisition', apiKeySet: true },
  { id: 'proj_3', name: 'Client Newsletter', description: 'Monthly updates for existing clients', apiKeySet: false },
  { id: 'proj_4', name: 'Holiday Sale 2024', description: 'E-commerce promotion', apiKeySet: true },
];

export const mockUsers: User[] = [
  { id: 'user_1', name: 'Sanchit Kakkar', email: 'sanchit@xava.com', role: 'Super Admin', status: 'Active', lastActive: new Date().toISOString() },
  { id: 'user_2', name: 'Jane Doe', email: 'jane@agencyone.com', role: 'User', status: 'Active', lastActive: subDays(new Date(), 2).toISOString() },
  { id: 'user_3', name: 'John Smith', email: 'john@agencytwo.com', role: 'User', status: 'Disabled', lastActive: subDays(new Date(), 15).toISOString() },
  { id: 'user_4', name: 'Emily White', email: 'emily@agencyone.com', role: 'User', status: 'Active', lastActive: subDays(new Date(), 1).toISOString() },
];

export const mockTemplates: Template[] = [
  { id: 'tpl_1', name: 'Welcome Email', category: 'Onboarding', lastUpdated: subDays(new Date(), 5).toISOString() },
  { id: 'tpl_2', name: 'Product Promotion', category: 'Marketing', lastUpdated: subDays(new Date(), 11).toISOString() },
  { id: 'tpl_3', name: 'Feature Update', category: 'Announcements', lastUpdated: subDays(new Date(), 18).toISOString() },
  { id: 'tpl_4', name: 'Password Reset', category: 'Transactional', lastUpdated: subDays(new Date(), 25).toISOString() },
];

export const mockCampaigns: Campaign[] = [
  { id: 'camp_1', name: 'Q3 Product Update', status: 'Sent', recipients: 5230, sentDate: '2024-07-20' },
  { id: 'camp_2', name: 'Summer Sale Kickoff', status: 'Sent', recipients: 15000, sentDate: '2024-07-15' },
  { id: 'camp_3', name: 'Welcome Series - Email 1', status: 'Active', recipients: 'Ongoing', sentDate: '2024-07-01' },
  { id: 'camp_4', name: 'New Feature Announcement', status: 'Draft', recipients: 0, sentDate: 'N/A' },
  { id: 'camp_5', name: 'Weekly Newsletter #128', status: 'Sent', recipients: 8942, sentDate: '2024-07-18' },
];
