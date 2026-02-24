import { apiRequestJson, apiRequestNoContent } from "@/shared/api/api-request";
import { assertNonEmptyString } from "@/shared/api/validation-utils";
import { API_PATHS } from "@/shared/constants/api-paths";
import { RIDE_API_ERROR_MESSAGES } from "@/shared/constants/api-messages";
import {
  RideFilters,
  RidePost,
  RidePostActivity,
  RidePostSummary,
  RidePostUpsertResponse,
  RideStatus,
  RideTrackingSession,
} from "@/shared/types";

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

const withQuery = (path: string, query?: string): string => {
  if (!query?.trim()) {
    return path;
  }
  return `${path}?${query}`;
};

const assertRideId = (id: string): void => {
  assertNonEmptyString(id, RIDE_API_ERROR_MESSAGES.rideIdRequired);
};

export const ridesApi = {
  async getPosts(filters: RideFilters = {}) {
    const query = buildQuery(filters);
    return apiRequestJson<{ content: RidePostSummary[] }>(
      withQuery(API_PATHS.rides.posts, query),
      {},
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.fetchRides }
    );
  },

  async getMyPosts() {
    return apiRequestJson<{ content: RidePostSummary[] }>(
      API_PATHS.rides.myPosts,
      {},
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.fetchRides }
    );
  },

  async getPost(id: string) {
    assertRideId(id);
    return apiRequestJson<RidePost>(
      API_PATHS.rides.post(id),
      {},
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.fetchRide }
    );
  },

  async createPost(payload: Partial<RidePost>) {
    return apiRequestJson<RidePostUpsertResponse>(
      API_PATHS.rides.posts,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.createRide }
    );
  },

  async updatePost(id: string, payload: Partial<RidePost>) {
    assertRideId(id);
    return apiRequestJson<RidePost>(
      API_PATHS.rides.post(id),
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.updateRide }
    );
  },

  async cancelPost(id: string) {
    assertRideId(id);
    await apiRequestNoContent(
      API_PATHS.rides.cancelPost(id),
      {
        method: "POST",
      },
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.cancelRide }
    );
  },

  async repostPost(id: string) {
    assertRideId(id);
    return apiRequestJson<RidePost>(
      API_PATHS.rides.repostPost(id),
      {
        method: "POST",
      },
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.repostRide }
    );
  },

  async rebookPost(id: string) {
    assertRideId(id);
    return apiRequestJson<RidePost>(
      API_PATHS.rides.rebookPost(id),
      {
        method: "POST",
      },
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.rebookRide }
    );
  },

  async updateStatus(id: string, status: RideStatus) {
    assertRideId(id);
    if (!status) {
      throw new Error(RIDE_API_ERROR_MESSAGES.statusRequired);
    }

    return apiRequestJson<RidePost>(
      API_PATHS.rides.updatePostStatus(id),
      {
        method: "POST",
        body: JSON.stringify({ status }),
      },
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.updateRideStatus }
    );
  },

  async startChat(id: string) {
    assertRideId(id);
    return apiRequestJson<{ chatThreadId: string }>(
      API_PATHS.rides.startPostChat(id),
      {
        method: "POST",
      },
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.startRideChat }
    );
  },

  async heartbeat(chatThreadId: string) {
    assertNonEmptyString(chatThreadId, RIDE_API_ERROR_MESSAGES.chatThreadIdRequired);
    await apiRequestNoContent(
      API_PATHS.rides.chatHeartbeat(chatThreadId),
      {
        method: "POST",
      },
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.recordRideHeartbeat }
    );
  },

  async bookPost(id: string) {
    assertRideId(id);
    return apiRequestJson<RidePost>(
      API_PATHS.rides.bookPost(id),
      {
        method: "POST",
      },
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.bookRide }
    );
  },

  async startTracking(id: string) {
    assertRideId(id);
    return apiRequestJson<RideTrackingSession>(
      API_PATHS.rides.startTracking(id),
      {
        method: "POST",
      },
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.startTracking }
    );
  },

  async updateLocation(id: string, lat: number, lng: number) {
    assertRideId(id);
    return apiRequestJson<RideTrackingSession>(
      API_PATHS.rides.updateTrackingLocation(id),
      {
        method: "POST",
        body: JSON.stringify({ lat, lng }),
      },
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.updateTrackingLocation }
    );
  },

  async getTracking(id: string) {
    assertRideId(id);
    return apiRequestJson<RideTrackingSession>(
      API_PATHS.rides.getTracking(id),
      {},
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.fetchTracking }
    );
  },

  async endTracking(id: string) {
    assertRideId(id);
    return apiRequestJson<RideTrackingSession>(
      API_PATHS.rides.endTracking(id),
      {
        method: "POST",
      },
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.endTracking }
    );
  },

  async getHomeActivities() {
    return apiRequestJson<{ content: RidePostActivity[] }>(
      API_PATHS.rides.homeActivities,
      {},
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.fetchRideActivities }
    );
  },

  async getMyActivities() {
    return apiRequestJson<{ content: RidePostActivity[] }>(
      API_PATHS.rides.myActivities,
      {},
      { fallbackErrorMessage: RIDE_API_ERROR_MESSAGES.fetchRideActivities }
    );
  },
};
