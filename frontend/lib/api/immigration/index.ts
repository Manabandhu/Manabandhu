import { API_BASE_URL } from '@/constants/api';
import { getAuthToken } from '@/lib/firebase';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: 'OFFICIAL' | 'LAW_FIRM' | 'NEWS_MEDIA';
  publishedAt: string;
  visaCategories: string[];
  countriesAffected: string[];
  tags: string[];
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isBreaking: boolean;
  isVerified: boolean;
  verificationNotes?: string;
  createdAt: string;
  isBookmarked: boolean;
}

export interface NewsFilters {
  visaCategory?: string;
  country?: string;
  impactLevel?: string;
  sourceType?: string;
  isBreaking?: boolean;
  page?: number;
  size?: number;
}

export interface NewsResponse {
  content: NewsArticle[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class ImmigrationNewsApiService {
  private async getHeaders() {
    const token = await getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getNews(filters: NewsFilters = {}): Promise<NewsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/immigration/news?${params}`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }

    return response.json();
  }

  async getNewsById(id: string): Promise<NewsArticle> {
    const response = await fetch(`${API_BASE_URL}/api/immigration/news/${id}`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch news article');
    }

    return response.json();
  }

  async bookmarkArticle(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/immigration/news/${id}/bookmark`, {
      method: 'POST',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to bookmark article');
    }
  }

  async removeBookmark(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/immigration/news/${id}/bookmark`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to remove bookmark');
    }
  }

  async getBookmarkedNews(page: number = 0, size: number = 20): Promise<NewsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/immigration/news/bookmarks?page=${page}&size=${size}`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bookmarked news');
    }

    return response.json();
  }
}

export const immigrationNewsApi = new ImmigrationNewsApiService();