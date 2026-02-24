import { apiRequestJson, apiRequestNoContent } from "@/shared/api/api-request";
import { API_PATHS } from "@/shared/constants/api-paths";
import { JOBS_API_ERROR_MESSAGES } from "@/shared/constants/api-messages";

export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "REMOTE";
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
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "REMOTE";
  salaryMin?: number;
  salaryMax?: number;
  contactEmail?: string;
  requirements?: string;
}

const withPaging = (path: string, page: number, size: number): string => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  return `${path}?${params.toString()}`;
};

class JobsAPI {
  async getAllJobs(page = 0, size = 10): Promise<{ content: Job[]; totalElements: number }> {
    return apiRequestJson<{ content: Job[]; totalElements: number }>(
      withPaging(API_PATHS.jobs.base, page, size),
      {},
      { fallbackErrorMessage: JOBS_API_ERROR_MESSAGES.fetchJobs }
    );
  }

  async searchJobs(
    keyword: string,
    page = 0,
    size = 10
  ): Promise<{ content: Job[]; totalElements: number }> {
    const params = new URLSearchParams({
      keyword,
      page: String(page),
      size: String(size),
    });

    return apiRequestJson<{ content: Job[]; totalElements: number }>(
      `${API_PATHS.jobs.search}?${params.toString()}`,
      {},
      { fallbackErrorMessage: JOBS_API_ERROR_MESSAGES.searchJobs }
    );
  }

  async getJobsByType(
    type: string,
    page = 0,
    size = 10
  ): Promise<{ content: Job[]; totalElements: number }> {
    return apiRequestJson<{ content: Job[]; totalElements: number }>(
      withPaging(API_PATHS.jobs.type(type), page, size),
      {},
      { fallbackErrorMessage: JOBS_API_ERROR_MESSAGES.fetchJobsByType }
    );
  }

  async getJobById(id: number): Promise<Job> {
    return apiRequestJson<Job>(
      API_PATHS.jobs.job(id),
      {},
      { fallbackErrorMessage: JOBS_API_ERROR_MESSAGES.fetchJob }
    );
  }

  async getUserJobs(
    userId: string,
    page = 0,
    size = 10
  ): Promise<{ content: Job[]; totalElements: number }> {
    return apiRequestJson<{ content: Job[]; totalElements: number }>(
      withPaging(API_PATHS.jobs.userJobs(userId), page, size),
      {},
      { fallbackErrorMessage: JOBS_API_ERROR_MESSAGES.fetchUserJobs }
    );
  }

  async createJob(request: CreateJobRequest): Promise<Job> {
    return apiRequestJson<Job>(
      API_PATHS.jobs.base,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
      { fallbackErrorMessage: JOBS_API_ERROR_MESSAGES.createJob }
    );
  }

  async deleteJob(id: number): Promise<void> {
    await apiRequestNoContent(
      API_PATHS.jobs.job(id),
      {
        method: "DELETE",
      },
      { fallbackErrorMessage: JOBS_API_ERROR_MESSAGES.deleteJob }
    );
  }
}

export const jobsAPI = new JobsAPI();
