import { API_BASE_URL } from '@/constants/api';
import { 
  Question, 
  Answer, 
  Tag, 
  QuestionRequest, 
  AnswerRequest, 
  VoteRequest, 
  ReportRequest,
  QuestionsFilter 
} from '@/types/qa';
import { toast } from '@/lib/toast';
import { getAuthToken } from '../auth-token';

export interface ApiError {
  status: number;
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
  timestamp: string;
}

class QaApiService {
  private baseUrl = `${API_BASE_URL}/api/qa`;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    showErrorToast: boolean = true
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          status: response.status,
          error: response.statusText,
          message: 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
        }));

        if (showErrorToast) {
          this.handleApiError(errorData);
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = 'Network error. Please check your connection and try again.';
        if (showErrorToast) {
          toast.showError(networkError);
        }
        throw new Error(networkError);
      }
      throw error;
    }
  }

  private handleApiError(error: ApiError) {
    switch (error.status) {
      case 400:
        if (error.fieldErrors) {
          const fieldMessages = Object.values(error.fieldErrors).join('\n');
          toast.showError(fieldMessages, 'Validation Error');
        } else {
          toast.showError(error.message || 'Invalid request');
        }
        break;
      case 401:
        toast.showError('Please log in to continue', 'Authentication Required');
        break;
      case 403:
        toast.showError('You don\'t have permission to perform this action', 'Access Denied');
        break;
      case 404:
        toast.showError('The requested resource was not found', 'Not Found');
        break;
      case 409:
        toast.showError(error.message || 'This action conflicts with existing data', 'Conflict');
        break;
      case 500:
        toast.showError('Server error. Please try again later', 'Server Error');
        break;
      default:
        toast.showError(error.message || 'An unexpected error occurred');
    }
  }

  private async getAuthHeaders() {
    const token = await getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getQuestions(filter: QuestionsFilter = {}) {
    const params = new URLSearchParams();
    if (filter.search) params.append('search', filter.search);
    if (filter.tags?.length) filter.tags.forEach(tag => params.append('tags', tag));
    if (filter.status) params.append('status', filter.status);
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.page !== undefined) params.append('page', filter.page.toString());
    if (filter.size !== undefined) params.append('size', filter.size.toString());

    return this.request<{
      content: Question[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>(`/questions?${params.toString()}`, {
      headers: await this.getAuthHeaders(),
    });
  }

  async getQuestion(id: string) {
    return this.request<Question>(`/questions/${id}`, {
      headers: await this.getAuthHeaders(),
    });
  }

  async createQuestion(data: QuestionRequest) {
    const result = await this.request<Question>('/questions', {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    toast.showSuccess('Your question has been posted successfully!');
    return result;
  }

  async getAnswers(questionId: string) {
    return this.request<Answer[]>(`/questions/${questionId}/answers`, {
      headers: await this.getAuthHeaders(),
    });
  }

  async createAnswer(questionId: string, data: AnswerRequest) {
    const result = await this.request<Answer>(`/questions/${questionId}/answers`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    toast.showSuccess('Your answer has been posted successfully!');
    return result;
  }

  async acceptAnswer(answerId: string) {
    await this.request<void>(`/answers/${answerId}/accept`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });
    
    toast.showSuccess('Answer accepted successfully!');
  }

  async vote(data: VoteRequest) {
    await this.request<void>('/votes', {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    }, false); // Don't show error toast for votes as they're frequent
  }

  async reportContent(data: ReportRequest) {
    await this.request<void>('/report', {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    toast.showSuccess('Content reported successfully. Thank you for helping keep our community safe.');
  }

  async getTags() {
    return this.request<Tag[]>('/tags');
  }

  async getUserQuestions(userId: string) {
    return this.request<Question[]>(`/users/${userId}/questions`, {
      headers: await this.getAuthHeaders(),
    });
  }

  async getUserAnswers(userId: string) {
    return this.request<Answer[]>(`/users/${userId}/answers`, {
      headers: await this.getAuthHeaders(),
    });
  }
}

export const qaApi = new QaApiService();