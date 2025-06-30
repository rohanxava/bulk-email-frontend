
export interface Project {
  id: string;
  name: string;
  description: string;
  apiKeySet: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'User';
  status: 'Active' | 'Disabled';
  lastActive: string; // ISO date string
}

export interface Template {
  id: string;
  name: string;
  category: string;
  lastUpdated: string; // Date string
  subject: string;
  htmlContent: string;
}

export interface Campaign {
  id:string;
  name: string;
  status: 'Sent' | 'Active' | 'Draft' | 'Failed';
  recipients: number | 'Ongoing';
  createdBy: string;
  createdDate: string; // Date string or 'N/A'
}
