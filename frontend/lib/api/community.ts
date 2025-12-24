import { API_BASE_URL } from '@/constants/api';
import { auth } from '@/lib/firebase';

export interface CommunityPost {
  id: number;
  authorId: string;
  authorName?: string;
  content: string;
  images: string[];
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;
}

export interface CreatePostRequest {
  content: string;
  images?: string[];
}

class CommunityAPI {
  private async getAuthHeaders() {
    const token = await auth?.currentUser?.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getAllPosts(page = 0, size = 10): Promise<{ content: CommunityPost[]; totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/api/community/posts?page=${page}&size=${size}`, {
      headers: await this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  }

  async getUserPosts(userId: string, page = 0, size = 10): Promise<{ content: CommunityPost[]; totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/api/community/posts/user/${userId}?page=${page}&size=${size}`, {
      headers: await this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch user posts');
    return response.json();
  }

  async createPost(request: CreatePostRequest): Promise<CommunityPost> {
    const response = await fetch(`${API_BASE_URL}/api/community/posts`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  }

  async likePost(postId: number): Promise<CommunityPost> {
    const response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/like`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to like post');
    return response.json();
  }

  async deletePost(postId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete post');
  }

  async updatePost(postId: number, request: CreatePostRequest): Promise<CommunityPost> {
    const response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to update post');
    return response.json();
  }
}

export const communityAPI = new CommunityAPI();