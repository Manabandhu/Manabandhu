import { API_BASE_URL } from "@/shared/constants/api";
import { getAuthHeaders } from "@/services/auth";
import { toast } from "@/lib/toast";
import {
  RoomListing,
  RoomListingActivity,
  RoomListingSummary,
  RoomReview,
  ReviewEligibility,
  RoomFilters,
  ReviewType,
  ListingStatus,
} from "@/shared/types";

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

const handleResponse = async (response: Response, successMessage?: string) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || `HTTP ${response.status}`;
    throw new Error(message);
  }
  
  if (successMessage) {
    toast.showSuccess(successMessage);
  }
  
  return response.json();
};

export const roomsApi = {
  async getListings(filters: RoomFilters & { status?: ListingStatus[] } = {}) {
    try {
      const query = buildQuery(filters);
      const response = await fetch(`${API_BASE_URL}/api/rooms/listings${query ? `?${query}` : ""}`,
        { headers: await getAuthHeaders() }
      );
      return await handleResponse(response) as { content: RoomListingSummary[] };
    } catch (error) {
      throw error;
    }
  },

  async getMyListings() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/listings/me`, {
        headers: await getAuthHeaders(),
      });
      return await handleResponse(response) as { content: RoomListingSummary[] };
    } catch (error) {
      throw error;
    }
  },

  async getListing(id: string) {
    try {
      if (!id?.trim()) {
        throw new Error('Listing ID is required');
      }
      const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${id}`, {
        headers: await getAuthHeaders(),
      });
      return await handleResponse(response) as RoomListing;
    } catch (error) {
      throw error;
    }
  },

  async createListing(payload: Partial<RoomListing>) {
    try {
      // Validate required fields
      if (!payload.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!payload.rentMonthly || payload.rentMonthly <= 0) {
        throw new Error('Valid rent amount is required');
      }
      if (!payload.latApprox || !payload.lngApprox) {
        throw new Error('Location is required');
      }
      if (!payload.approxAreaLabel?.trim()) {
        throw new Error('Area label is required');
      }
      if (!payload.listingFor) {
        throw new Error('Listing type is required');
      }
      if (!payload.roomType) {
        throw new Error('Room type is required');
      }
      if (!payload.visitType) {
        throw new Error('Visit type is required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/rooms/listings`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to create listing (${response.status})`;
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      toast.showSuccess('Room listing created successfully!');
      return result as RoomListing;
    } catch (error) {
      // Re-throw with better error message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while creating the listing');
    }
  },

  async updateListing(id: string, payload: Partial<RoomListing>) {
    try {
      if (!id?.trim()) {
        throw new Error('Listing ID is required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${id}`, {
        method: "PUT",
        headers: await getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return await handleResponse(response, 'Room listing updated successfully!') as RoomListing;
    } catch (error) {
      throw error;
    }
  },

  async deleteListing(id: string) {
    try {
      if (!id?.trim()) {
        throw new Error('Listing ID is required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      await handleResponse(response, 'Room listing deleted successfully!');
    } catch (error) {
      throw error;
    }
  },

  async repostListing(id: string) {
    try {
      if (!id?.trim()) {
        throw new Error('Listing ID is required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${id}/repost`, {
        method: "POST",
        headers: await getAuthHeaders(),
      });
      return await handleResponse(response, 'Room listing reposted successfully!') as RoomListing;
    } catch (error) {
      throw error;
    }
  },

  async updateStatus(id: string, status: ListingStatus) {
    try {
      if (!id?.trim()) {
        throw new Error('Listing ID is required');
      }
      if (!status) {
        throw new Error('Status is required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${id}/status`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      return await handleResponse(response, 'Listing status updated successfully!') as RoomListing;
    } catch (error) {
      throw error;
    }
  },

  async startChat(id: string) {
    try {
      if (!id?.trim()) {
        throw new Error('Listing ID is required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${id}/chat/start`, {
        method: "POST",
        headers: await getAuthHeaders(),
      });
      return await handleResponse(response, 'Chat started successfully!') as { chatThreadId: string };
    } catch (error) {
      throw error;
    }
  },

  async heartbeat(chatThreadId: string) {
    try {
      if (!chatThreadId?.trim()) {
        throw new Error('Chat thread ID is required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/rooms/chats/${chatThreadId}/heartbeat`, {
        method: "POST",
        headers: await getAuthHeaders(),
      });
      await handleResponse(response);
    } catch (error) {
      // Don't show error toast for heartbeat failures
      throw error;
    }
  },

  async getReviews(listingId: string) {
    try {
      if (!listingId?.trim()) {
        throw new Error('Listing ID is required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${listingId}/reviews`, {
        headers: await getAuthHeaders(),
      });
      return await handleResponse(response) as RoomReview[];
    } catch (error) {
      throw error;
    }
  },

  async createReview(listingId: string, payload: { type: ReviewType; rating: number; tags?: string[]; comment?: string }) {
    try {
      if (!listingId?.trim()) {
        throw new Error('Listing ID is required');
      }
      if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${listingId}/reviews`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return await handleResponse(response, 'Review submitted successfully!') as RoomReview;
    } catch (error) {
      throw error;
    }
  },

  async updateReview(reviewId: string, payload: { rating: number; tags?: string[]; comment?: string }) {
    try {
      if (!reviewId?.trim()) {
        throw new Error('Review ID is required');
      }
      if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/rooms/reviews/${reviewId}`, {
        method: "PUT",
        headers: await getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return await handleResponse(response, 'Review updated successfully!') as RoomReview;
    } catch (error) {
      throw error;
    }
  },

  async flagReview(reviewId: string) {
    try {
      if (!reviewId?.trim()) {
        throw new Error('Review ID is required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/rooms/reviews/${reviewId}/flag`, {
        method: "POST",
        headers: await getAuthHeaders(),
      });
      return await handleResponse(response, 'Review flagged successfully!') as RoomReview;
    } catch (error) {
      throw error;
    }
  },

  async getReviewEligibility(listingId: string) {
    try {
      if (!listingId?.trim()) {
        throw new Error('Listing ID is required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${listingId}/reviews/eligibility`, {
        headers: await getAuthHeaders(),
      });
      return await handleResponse(response) as ReviewEligibility;
    } catch (error) {
      throw error;
    }
  },

  async getHomeActivities() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/activities/home`, {
        headers: await getAuthHeaders(),
      });
      return await handleResponse(response) as { content: RoomListingActivity[] };
    } catch (error) {
      throw error;
    }
  },

  async getMyActivities() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/activities/me`, {
        headers: await getAuthHeaders(),
      });
      return await handleResponse(response) as { content: RoomListingActivity[] };
    } catch (error) {
      throw error;
    }
  },

  // Saved Listings
  async saveListing(id: string, notes?: string) {
    try {
      if (!id?.trim()) {
        throw new Error('Listing ID is required');
      }
      const url = notes 
        ? `${API_BASE_URL}/api/rooms/listings/${id}/save?notes=${encodeURIComponent(notes)}`
        : `${API_BASE_URL}/api/rooms/listings/${id}/save`;
      const response = await fetch(url, {
        method: "POST",
        headers: await getAuthHeaders(),
      });
      return await handleResponse(response, 'Listing saved!') as { saved: boolean };
    } catch (error) {
      throw error;
    }
  },

  async unsaveListing(id: string) {
    try {
      if (!id?.trim()) {
        throw new Error('Listing ID is required');
      }
      const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${id}/save`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      return await handleResponse(response, 'Listing removed from saved') as { saved: boolean };
    } catch (error) {
      throw error;
    }
  },

  async isSaved(id: string) {
    try {
      if (!id?.trim()) {
        throw new Error('Listing ID is required');
      }
      const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${id}/saved`, {
        headers: await getAuthHeaders(),
      });
      return await handleResponse(response) as { saved: boolean };
    } catch (error) {
      throw error;
    }
  },

  async getSavedListings(filters: RoomFilters = {}) {
    try {
      const query = buildQuery(filters);
      const response = await fetch(`${API_BASE_URL}/api/rooms/listings/saved${query ? `?${query}` : ""}`, {
        headers: await getAuthHeaders(),
      });
      return await handleResponse(response) as { content: RoomListingSummary[] };
    } catch (error) {
      throw error;
    }
  },

  // Price Alerts
  async createPriceAlert(payload: {
    minRent?: number;
    maxRent?: number;
    roomType?: string;
    listingFor?: string;
    amenities?: string[];
    minLat?: number;
    maxLat?: number;
    minLng?: number;
    maxLng?: number;
    areaLabel?: string;
    availableBy?: string;
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/alerts`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return await handleResponse(response, 'Price alert created!') as { id: string };
    } catch (error) {
      throw error;
    }
  },

  async getPriceAlerts() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/alerts`, {
        headers: await getAuthHeaders(),
      });
      return await handleResponse(response) as { content: any[] };
    } catch (error) {
      throw error;
    }
  },

  async deletePriceAlert(alertId: string) {
    try {
      if (!alertId?.trim()) {
        throw new Error('Alert ID is required');
      }
      const response = await fetch(`${API_BASE_URL}/api/rooms/alerts/${alertId}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      return await handleResponse(response, 'Price alert deleted!');
    } catch (error) {
      throw error;
    }
  },

  // Reporting
  async reportListing(id: string, reason: string, description?: string) {
    try {
      if (!id?.trim()) {
        throw new Error('Listing ID is required');
      }
      if (!reason) {
        throw new Error('Report reason is required');
      }
      const response = await fetch(`${API_BASE_URL}/api/rooms/listings/${id}/report`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ reason, description }),
      });
      return await handleResponse(response, 'Thank you for reporting. We will review this listing.') as { reported: boolean };
    } catch (error) {
      throw error;
    }
  },
};
