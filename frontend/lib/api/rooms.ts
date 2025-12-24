import { API_BASE_URL } from "@/constants/api";
import { auth } from "@/lib/firebase";
import {
  RoomListing,
  RoomListingActivity,
  RoomListingSummary,
  RoomReview,
  ReviewEligibility,
  RoomFilters,
  ReviewType,
  ListingStatus,
} from "@/types";

const buildQuery = (filters: RoomFilters & { status?: ListingStatus[] }) => {
  const params = new URLSearchParams();
  if (filters.minRent !== undefined) params.append("minRent", String(filters.minRent));
  if (filters.maxRent !== undefined) params.append("maxRent", String(filters.maxRent));
  if (filters.roomType) params.append("roomType", filters.roomType);
  if (filters.listingFor) params.append("listingFor", filters.listingFor);
  if (filters.amenities?.length) {
    filters.amenities.forEach((amenity) => params.append("amenities", amenity));
  }
  if (filters.availableBy) params.append("availableBy", filters.availableBy);
  if (filters.lat !== undefined) params.append("lat", String(filters.lat));
  if (filters.lng !== undefined) params.append("lng", String(filters.lng));
  if (filters.radiusKm !== undefined) params.append("radiusKm", String(filters.radiusKm));
  if (filters.status?.length) {
    filters.status.forEach((status) => params.append("status", status));
  }
  return params.toString();
};

const getAuthHeaders = async () => {
  const token = await auth?.currentUser?.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const roomsApi = {
  async getListings(filters: RoomFilters & { status?: ListingStatus[] } = {}) {
    const query = buildQuery(filters);
    const response = await fetch(`${API_BASE_URL}/api/rooms/listings${query ? `?${query}` : ""}`,
      { headers: await getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch listings");
    return response.json() as Promise<{ content: RoomListingSummary[] }>;
  },

  async getMyListings() {
    const response = await fetch(`${API_BASE_URL}/api/rooms/listings/me`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch listings");
    return response.json() as Promise<{ content: RoomListingSummary[] }>;
  },

  async getListing(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch listing");
    return response.json() as Promise<RoomListing>;
  },

  async createListing(payload: Partial<RoomListing>) {
    const response = await fetch(`${API_BASE_URL}/api/rooms/listings`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to create listing");
    return response.json() as Promise<RoomListing>;
  },

  async updateListing(id: string, payload: Partial<RoomListing>) {
    const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${id}`, {
      method: "PUT",
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to update listing");
    return response.json() as Promise<RoomListing>;
  },

  async deleteListing(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete listing");
  },

  async repostListing(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${id}/repost`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to repost listing");
    return response.json() as Promise<RoomListing>;
  },

  async updateStatus(id: string, status: ListingStatus) {
    const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${id}/status`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update status");
    return response.json() as Promise<RoomListing>;
  },

  async startChat(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${id}/chat/start`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to start chat");
    return response.json() as Promise<{ chatThreadId: string }>;
  },

  async heartbeat(chatThreadId: string) {
    const response = await fetch(`${API_BASE_URL}/api/rooms/chats/${chatThreadId}/heartbeat`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to record heartbeat");
  },

  async getReviews(listingId: string) {
    const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${listingId}/reviews`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch reviews");
    return response.json() as Promise<RoomReview[]>;
  },

  async createReview(listingId: string, payload: { type: ReviewType; rating: number; tags?: string[]; comment?: string }) {
    const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${listingId}/reviews`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to submit review");
    return response.json() as Promise<RoomReview>;
  },

  async updateReview(reviewId: string, payload: { rating: number; tags?: string[]; comment?: string }) {
    const response = await fetch(`${API_BASE_URL}/api/rooms/reviews/${reviewId}`, {
      method: "PUT",
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to update review");
    return response.json() as Promise<RoomReview>;
  },

  async flagReview(reviewId: string) {
    const response = await fetch(`${API_BASE_URL}/api/rooms/reviews/${reviewId}/flag`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to flag review");
    return response.json() as Promise<RoomReview>;
  },

  async getReviewEligibility(listingId: string) {
    const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${listingId}/reviews/eligibility`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch review eligibility");
    return response.json() as Promise<ReviewEligibility>;
  },

  async getHomeActivities() {
    const response = await fetch(`${API_BASE_URL}/api/rooms/activities/home`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch activities");
    return response.json() as Promise<{ content: RoomListingActivity[] }>;
  },

  async getMyActivities() {
    const response = await fetch(`${API_BASE_URL}/api/rooms/activities/me`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch activities");
    return response.json() as Promise<{ content: RoomListingActivity[] }>;
  },
};
