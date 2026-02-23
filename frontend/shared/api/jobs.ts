import { API_BASE_URL } from '@/shared/constants/api';
import { getAuthHeaders } from '@/services/auth';

export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  salaryMin?: number;
  salaryMax?: number;
  postedBy: string;
  contactEmail?: string;
  requirements?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRequest {
  title: string;
  company: string;
  description: string;
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  salaryMin?: number;
  salaryMax?: number;
  contactEmail?: string;
  requirements?: string;
}

class JobsAPI {
  async getAllJobs(page = 0, size = 10): Promise<{ content: Job[]; totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/api/jobs?page=${page}&size=${size}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
  }

  async searchJobs(keyword: string, page = 0, size = 10): Promise<{ content: Job[]; totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to search jobs');
    return response.json();
  }

  async getJobsByType(type: string, page = 0, size = 10): Promise<{ content: Job[]; totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/type/${type}?page=${page}&size=${size}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch jobs by type');
    return response.json();
  }

  async getJobById(id: number): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch job');
    return response.json();
  }

  async getUserJobs(userId: string, page = 0, size = 10): Promise<{ content: Job[]; totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/user/${userId}?page=${page}&size=${size}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch user jobs');
    return response.json();
  }

  async createJob(request: CreateJobRequest): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to create job');
    return response.json();
  }

  async deleteJob(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete job');
  }
}

export const jobsAPI = new JobsAPI();
