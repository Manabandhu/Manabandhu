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

class QaApiService {
  private baseUrl = `${API_BASE_URL}/api/qa`;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async getQuestions(filter: QuestionsFilter = {}, token?: string) {
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
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async getQuestion(id: string, token?: string) {
    return this.request<Question>(`/questions/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async createQuestion(data: QuestionRequest, token: string) {
    return this.request<Question>('/questions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  async getAnswers(questionId: string, token?: string) {
    return this.request<Answer[]>(`/questions/${questionId}/answers`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async createAnswer(questionId: string, data: AnswerRequest, token: string) {
    return this.request<Answer>(`/questions/${questionId}/answers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  async acceptAnswer(answerId: string, token: string) {
    return this.request<void>(`/answers/${answerId}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async vote(data: VoteRequest, token: string) {
    return this.request<void>('/votes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  async reportContent(data: ReportRequest, token: string) {
    return this.request<void>('/report', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  async getTags() {
    return this.request<Tag[]>('/tags');
  }

  async getUserQuestions(userId: string, token?: string) {
    return this.request<Question[]>(`/users/${userId}/questions`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async getUserAnswers(userId: string, token?: string) {
    return this.request<Answer[]>(`/users/${userId}/answers`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }
}

export const qaApi = new QaApiService();