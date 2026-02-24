import { apiRequestJson, apiRequestNoContent } from "@/shared/api/api-request";
import { API_PATHS } from "@/shared/constants/api-paths";
import { COMMUNITY_API_ERROR_MESSAGES } from "@/shared/constants/api-messages";

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

export interface Comment {
  id: number;
  postId: number;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const withPaging = (path: string, page: number, size: number): string => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  return `${path}?${params.toString()}`;
};

class CommunityAPI {
  async getAllPosts(page = 0, size = 10): Promise<{ content: CommunityPost[]; totalElements: number }> {
    return apiRequestJson<{ content: CommunityPost[]; totalElements: number }>(
      withPaging(API_PATHS.community.posts, page, size),
      {},
      { fallbackErrorMessage: COMMUNITY_API_ERROR_MESSAGES.fetchPosts }
    );
  }

  async getUserPosts(
    userId: string,
    page = 0,
    size = 10
  ): Promise<{ content: CommunityPost[]; totalElements: number }> {
    return apiRequestJson<{ content: CommunityPost[]; totalElements: number }>(
      withPaging(API_PATHS.community.userPosts(userId), page, size),
      {},
      { fallbackErrorMessage: COMMUNITY_API_ERROR_MESSAGES.fetchUserPosts }
    );
  }

  async createPost(request: CreatePostRequest): Promise<CommunityPost> {
    return apiRequestJson<CommunityPost>(
      API_PATHS.community.posts,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
      { fallbackErrorMessage: COMMUNITY_API_ERROR_MESSAGES.createPost }
    );
  }

  async likePost(postId: number): Promise<CommunityPost> {
    return apiRequestJson<CommunityPost>(
      API_PATHS.community.likePost(postId),
      {
        method: "POST",
      },
      { fallbackErrorMessage: COMMUNITY_API_ERROR_MESSAGES.likePost }
    );
  }

  async deletePost(postId: number): Promise<void> {
    await apiRequestNoContent(
      API_PATHS.community.post(postId),
      {
        method: "DELETE",
      },
      { fallbackErrorMessage: COMMUNITY_API_ERROR_MESSAGES.deletePost }
    );
  }

  async updatePost(postId: number, request: CreatePostRequest): Promise<CommunityPost> {
    return apiRequestJson<CommunityPost>(
      API_PATHS.community.post(postId),
      {
        method: "PUT",
        body: JSON.stringify(request),
      },
      { fallbackErrorMessage: COMMUNITY_API_ERROR_MESSAGES.updatePost }
    );
  }

  async getPostComments(
    postId: number,
    page = 0,
    size = 50
  ): Promise<{ content: Comment[]; totalElements: number }> {
    return apiRequestJson<{ content: Comment[]; totalElements: number }>(
      withPaging(API_PATHS.community.postComments(postId), page, size),
      {},
      { fallbackErrorMessage: COMMUNITY_API_ERROR_MESSAGES.fetchComments }
    );
  }

  async addComment(postId: number, content: string): Promise<Comment> {
    return apiRequestJson<Comment>(
      API_PATHS.community.postComments(postId),
      {
        method: "POST",
        body: JSON.stringify({ content }),
      },
      { fallbackErrorMessage: COMMUNITY_API_ERROR_MESSAGES.addComment }
    );
  }

  async deleteComment(postId: number, commentId: number): Promise<void> {
    await apiRequestNoContent(
      API_PATHS.community.comment(postId, commentId),
      {
        method: "DELETE",
      },
      { fallbackErrorMessage: COMMUNITY_API_ERROR_MESSAGES.deleteComment }
    );
  }
}

export const communityAPI = new CommunityAPI();
