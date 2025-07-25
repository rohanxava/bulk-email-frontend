

import axios from 'axios';


const Baseurl = process.env.NEXT_PUBLIC_BASE_URL ;
const BASE_URL= `${Baseurl}/api`;
const api = axios.create({
  baseURL: `${BASE_URL}`,
});


// const api = axios.create({
//   baseURL: 'http://localhost:5000/api',
// });

export default api;

import { mockProjects, mockUsers, mockTemplates, mockCampaigns } from './mock-data';
import type { Project, User, Template, Campaign } from '@/lib/types';

// Simulate a network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));



// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const getToken = () => {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
};



export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch current user');
  return res.json();
};


export const updateCurrentUser = async (updatedFields: { name?: string }) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const res = await fetch(`${BASE_URL}/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedFields),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update user');
  }

  return res.json();
};

export const updatePassword = async (currentPassword: string, newPassword: string) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const res = await fetch(`${BASE_URL}/me/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update password');
  }

  return res.json();
};


/////////////////////////////////////projects/////////////////////////////////////

export const fetchProjects = async () => {
  const res = await axios.get(`${BASE_URL}/projects`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.data;
};

export const fetchProjectById = async (id: string) => {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const createProject = async (data: any) => {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateProject = async (id: string, data: any) => {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteProject = async (id: string) => {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

///////////////////////////////projects///////////////////////////////////////////////////////////


/////////////////////////////templates/////////////////////////////////////


export const createTemplate = async (data) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('subject', data.subject);
  formData.append('htmlContent', data.htmlContent);
  formData.append('projectId', data.projectId);

  if (data.attachment) {
    formData.append('attachment', data.attachment); // PDF file
  }

  const token = localStorage.getItem('token'); // Get JWT from storage

  const res = await fetch(`${BASE_URL}/templates?type=template`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Template creation failed');
  }

  return res.json();
};



export const getTemplates = async (projectId?: string) => {
  const url = projectId
    ? `${BASE_URL}/templates?projectId=${projectId}`
    : `${BASE_URL}/templates`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch templates");
  }

  return res.json();
};


export const updateTemplate = async (id, formData) => {
    const token = localStorage.getItem('token');

    const res = await fetch(`${BASE_URL}/templates/${id}?type=template`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData, // FormData supports file uploads
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Template update failed');
    }

    return res.json();
};


export const deleteTemplate = async (id: string) => {
  const res = await fetch(`${BASE_URL}/templates/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};


export const getTemplateById = async (id: string) => {
  const res = await fetch(`${BASE_URL}/templates/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch template");
  return res.json();
}

/////////////////////////////templates/////////////////////////////////////


//////////////////////campaigns///////////////////////////////////////

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

// 📌 Get all campaigns
export const getCampaigns = async () => {
  const res = await fetch(`${BASE_URL}/campaign`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch campaigns");
  return res.json();
};

// 📌 Get a single campaign by ID
export const getCampaignById = async (id: string) => {
  const res = await fetch(`${BASE_URL}/campaign/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) return null;
  return res.json();
};

// 📌 Create or update campaign
export const saveCampaign = async (data: any) => {
  const res = await fetch(`${BASE_URL}/campaign/save`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to save campaign');
  }

  return res.json();
};

// 📌 Delete campaign by ID
export const deleteCampaign = async (id: string) => {
  const res = await fetch(`${BASE_URL}/campaign/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to delete campaign');
  }

  return res.json();
};

// 📌 Send campaign
export const sendCampaign = async (data: FormData) => {
  const res = await fetch(`${BASE_URL}/campaign/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
      // ⚠️ Don't set Content-Type for FormData (browser sets boundary automatically)
    },
    body: data,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Send failed');
  }

  return res.json();
};


////////////////////////////campaigns/////////////////////////////////////


////////////////////////////analytics/////////////////////////////////////
export const getAnalyticsSummary = async () => {
  const res = await fetch(`${BASE_URL}/analytics/summary`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch analytics summary");
  return res.json();
};


export const getCampaignStatusCounts = async () => {
  const res = await fetch(`${BASE_URL}/analytics/status-counts`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch campaign status counts");
  return res.json();
};
////////////////////////////analytics/////////////////////////////////////




//////////////////////////users////////////////////////////////
export const getUsers = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

export const deleteUser = async (id: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
};

export const updateUser = async (id: string, updatedData: any) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
};


export const getUserById = async (id: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
};

//////////////////////////users////////////////////////////////


/////////////////////////OPEN AI////////////////////////////////

export const generateTemplateWithAI = async (prompt: string) => {
  const res = await fetch(`${BASE_URL}/generate-template`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "AI template generation failed");
  }
  return res.json(); // { subject, htmlContent }
};

/////////////////////////OPEN AI////////////////////////////////




//////////////////////PING ACTIVE//////////////////////////////

export const pingUser = async () => {
  const token = localStorage.getItem('token');

  return fetch(`${BASE_URL}/users/ping`, {
    method: 'POST',
    // credentials: 'include', // Keep this if you also use cookies (optional)
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` // ✅ Add token here
    }
  })
  .then(res => {
    if (!res.ok) throw new Error('Ping failed');
    return res.json();
  })
  .catch(err => {
    console.error('Ping error:', err);
  });
};


//////////////////////PING ACTIVE//////////////////////////////


export const uploadContactList = async (formData: FormData) => {
  const res = await fetch(`${BASE_URL}/lists/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`
      // Do NOT set Content-Type for FormData
    },
    body: formData
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to upload contact list');
  }

  return res.json(); // returns saved contact list
};

export const getContactLists = async () => {
  const res = await fetch(`${BASE_URL}/lists`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch contact lists');
  return res.json();
};

export const deleteContactList = async (id: string) => {
  const res = await fetch(`${BASE_URL}/lists/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error('Failed to delete contact list');
  return res.json();
};

export const downloadContactList = async (id: string) => {
  const res = await fetch(`${BASE_URL}/lists/download/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error('Failed to download contact list');
  return res.blob(); // returns file
};