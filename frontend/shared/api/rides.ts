import { API_BASE_URL } from "@/shared/constants/api";
import { getAuthToken } from "@/services/auth";
import {
  RideFilters,
  RidePost,
  RidePostActivity,
  RidePostSummary,
  RidePostUpsertResponse,
  RideStatus,
  RideTrackingSession,
} from "@/shared/types";

const getAuthHeaders = async () => {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const buildQuery = (filters: RideFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.type) params.append("type", filters.type);
  if (filters.departAfter) params.append("departAfter", filters.departAfter);
  if (filters.departBefore) params.append("departBefore", filters.departBefore);
  if (filters.seats !== undefined) params.append("seats", String(filters.seats));
  if (filters.minPrice !== undefined) params.append("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.append("maxPrice", String(filters.maxPrice));
  if (filters.lat !== undefined) params.append("lat", String(filters.lat));
  if (filters.lng !== undefined) params.append("lng", String(filters.lng));
  if (filters.radiusMiles !== undefined) params.append("radiusMiles", String(filters.radiusMiles));
  if (filters.luggage !== undefined) params.append("luggage", String(filters.luggage));
  if (filters.pets !== undefined) params.append("pets", String(filters.pets));
  if (filters.status?.length) {
    filters.status.forEach((status) => params.append("status", status));
  }
  return params.toString();
};

export const ridesApi = {
  async getPosts(filters: RideFilters = {}) {
    const query = buildQuery(filters);
    const response = await fetch(`${API_BASE_URL}/api/rides/posts${query ? `?${query}` : ""}`,
      { headers: await getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch rides");
    return response.json() as Promise<{ content: RidePostSummary[] }>;
  },

  async getMyPosts() {
    const response = await fetch(`${API_BASE_URL}/api/rides/posts/me`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch rides");
    return response.json() as Promise<{ content: RidePostSummary[] }>;
  },

  async getPost(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/rides/posts/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch ride");
    return response.json() as Promise<RidePost>;
  },

  async createPost(payload: Partial<RidePost>) {
    const response = await fetch(`${API_BASE_URL}/api/rides/posts`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to create ride");
    return response.json() as Promise<RidePostUpsertResponse>;
  },

  async updatePost(id: string, payload: Partial<RidePost>) {
    const response = await fetch(`${API_BASE_URL}/api/rides/posts/${id}`, {
      method: "PUT",
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to update ride");
    return response.json() as Promise<RidePost>;
  },

  async cancelPost(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/rides/posts/${id}/cancel`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to cancel ride");
  },

  async repostPost(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/rides/posts/${id}/repost`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to repost ride");
    return response.json() as Promise<RidePost>;
  },

  async rebookPost(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/rides/posts/${id}/rebook`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to rebook ride");
    return response.json() as Promise<RidePost>;
  },

  async updateStatus(id: string, status: RideStatus) {
    const response = await fetch(`${API_BASE_URL}/api/rides/posts/${id}/status`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update status");
    return response.json() as Promise<RidePost>;
  },

  async startChat(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/rides/posts/${id}/chat/start`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to start chat");
    return response.json() as Promise<{ chatThreadId: string }>;
  },

  async heartbeat(chatThreadId: string) {
    const response = await fetch(`${API_BASE_URL}/api/rides/chats/${chatThreadId}/heartbeat`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to record heartbeat");
  },

  async bookPost(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/rides/posts/${id}/book`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to book ride");
    return response.json() as Promise<RidePost>;
  },

  async startTracking(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/rides/posts/${id}/tracking/start`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to start tracking");
    return response.json() as Promise<RideTrackingSession>;
  },

  async updateLocation(id: string, lat: number, lng: number) {
    const response = await fetch(`${API_BASE_URL}/api/rides/posts/${id}/tracking/location`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ lat, lng }),
    });
    if (!response.ok) throw new Error("Failed to update location");
    return response.json() as Promise<RideTrackingSession>;
  },

  async getTracking(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/rides/posts/${id}/tracking`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch tracking");
    return response.json() as Promise<RideTrackingSession>;
  },

  async endTracking(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/rides/posts/${id}/tracking/end`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to end tracking");
    return response.json() as Promise<RideTrackingSession>;
  },

  async getHomeActivities() {
    const response = await fetch(`${API_BASE_URL}/api/rides/activities/home`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch activities");
    return response.json() as Promise<{ content: RidePostActivity[] }>;
  },

  async getMyActivities() {
    const response = await fetch(`${API_BASE_URL}/api/rides/activities/me`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch activities");
    return response.json() as Promise<{ content: RidePostActivity[] }>;
  },
};
