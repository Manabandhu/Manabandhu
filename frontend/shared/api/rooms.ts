import { apiRequestJson, apiRequestNoContent } from "@/shared/api/api-request";
import {
  assertNonEmptyString,
  assertNumberInRange,
  assertPositiveNumber,
} from "@/shared/api/validation-utils";
import { API_PATHS } from "@/shared/constants/api-paths";
import {
  ROOM_API_CONSTRAINTS,
  ROOM_API_ERROR_MESSAGES,
  ROOM_API_SUCCESS_MESSAGES,
} from "@/shared/constants/api-messages";
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

const withQuery = (path: string, query?: string): string => {
  if (!query?.trim()) {
    return path;
  }
  return `${path}?${query}`;
};

const assertListingId = (id: string): void => {
  assertNonEmptyString(id, ROOM_API_ERROR_MESSAGES.listingIdRequired);
};

const assertReviewId = (reviewId: string): void => {
  assertNonEmptyString(reviewId, ROOM_API_ERROR_MESSAGES.reviewIdRequired);
};

const assertAlertId = (alertId: string): void => {
  assertNonEmptyString(alertId, ROOM_API_ERROR_MESSAGES.alertIdRequired);
};

const assertReviewRating = (rating: number): void => {
  assertNumberInRange(
    rating,
    ROOM_API_CONSTRAINTS.minReviewRating,
    ROOM_API_CONSTRAINTS.maxReviewRating,
    ROOM_API_ERROR_MESSAGES.ratingRange
  );
};

const validateCreateListingPayload = (payload: Partial<RoomListing>): void => {
  assertNonEmptyString(payload.title, ROOM_API_ERROR_MESSAGES.titleRequired);
  assertPositiveNumber(payload.rentMonthly, ROOM_API_ERROR_MESSAGES.validRentRequired);

  const hasLocation =
    typeof payload.latApprox === "number" &&
    Number.isFinite(payload.latApprox) &&
    typeof payload.lngApprox === "number" &&
    Number.isFinite(payload.lngApprox);

  if (!hasLocation) {
    throw new Error(ROOM_API_ERROR_MESSAGES.locationRequired);
  }

  assertNonEmptyString(payload.approxAreaLabel, ROOM_API_ERROR_MESSAGES.areaLabelRequired);

  if (!payload.listingFor) {
    throw new Error(ROOM_API_ERROR_MESSAGES.listingTypeRequired);
  }
  if (!payload.roomType) {
    throw new Error(ROOM_API_ERROR_MESSAGES.roomTypeRequired);
  }
  if (!payload.visitType) {
    throw new Error(ROOM_API_ERROR_MESSAGES.visitTypeRequired);
  }
};

export const roomsApi = {
  async getListings(filters: RoomFilters & { status?: ListingStatus[] } = {}) {
    const query = buildQuery(filters);
    return apiRequestJson<{ content: RoomListingSummary[] }>(
      withQuery(API_PATHS.rooms.listings, query)
    );
  },

  async getMyListings() {
    return apiRequestJson<{ content: RoomListingSummary[] }>(API_PATHS.rooms.myListings);
  },

  async getListing(id: string) {
    assertListingId(id);
    return apiRequestJson<RoomListing>(API_PATHS.rooms.listing(id));
  },

  async createListing(payload: Partial<RoomListing>) {
    validateCreateListingPayload(payload);

    return apiRequestJson<RoomListing>(
      API_PATHS.rooms.listings,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      {
        successMessage: ROOM_API_SUCCESS_MESSAGES.listingCreated,
        fallbackErrorMessage: ROOM_API_ERROR_MESSAGES.unexpectedCreateListing,
      }
    );
  },

  async updateListing(id: string, payload: Partial<RoomListing>) {
    assertListingId(id);

    return apiRequestJson<RoomListing>(
      API_PATHS.rooms.listing(id),
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      {
        successMessage: ROOM_API_SUCCESS_MESSAGES.listingUpdated,
      }
    );
  },

  async deleteListing(id: string) {
    assertListingId(id);

    await apiRequestNoContent(
      API_PATHS.rooms.listing(id),
      {
        method: "DELETE",
      },
      {
        successMessage: ROOM_API_SUCCESS_MESSAGES.listingDeleted,
      }
    );
  },

  async repostListing(id: string) {
    assertListingId(id);

    return apiRequestJson<RoomListing>(
      API_PATHS.rooms.repostListing(id),
      {
        method: "POST",
      },
      {
        successMessage: ROOM_API_SUCCESS_MESSAGES.listingReposted,
      }
    );
  },

  async updateStatus(id: string, status: ListingStatus) {
    assertListingId(id);
    if (!status) {
      throw new Error(ROOM_API_ERROR_MESSAGES.statusRequired);
    }

    return apiRequestJson<RoomListing>(
      API_PATHS.rooms.updateListingStatus(id),
      {
        method: "POST",
        body: JSON.stringify({ status }),
      },
      {
        successMessage: ROOM_API_SUCCESS_MESSAGES.listingStatusUpdated,
      }
    );
  },

  async startChat(id: string) {
    assertListingId(id);

    return apiRequestJson<{ chatThreadId: string }>(
      API_PATHS.rooms.startListingChat(id),
      {
        method: "POST",
      },
      {
        successMessage: ROOM_API_SUCCESS_MESSAGES.chatStarted,
      }
    );
  },

  async heartbeat(chatThreadId: string) {
    assertNonEmptyString(chatThreadId, ROOM_API_ERROR_MESSAGES.chatThreadIdRequired);

    await apiRequestNoContent(API_PATHS.rooms.chatHeartbeat(chatThreadId), {
      method: "POST",
    });
  },

  async getReviews(listingId: string) {
    assertListingId(listingId);
    return apiRequestJson<RoomReview[]>(API_PATHS.rooms.listingReviews(listingId));
  },

  async createReview(
    listingId: string,
    payload: { type: ReviewType; rating: number; tags?: string[]; comment?: string }
  ) {
    assertListingId(listingId);
    assertReviewRating(payload.rating);

    return apiRequestJson<RoomReview>(
      API_PATHS.rooms.listingReviews(listingId),
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      {
        successMessage: ROOM_API_SUCCESS_MESSAGES.reviewSubmitted,
      }
    );
  },

  async updateReview(reviewId: string, payload: { rating: number; tags?: string[]; comment?: string }) {
    assertReviewId(reviewId);
    assertReviewRating(payload.rating);

    return apiRequestJson<RoomReview>(
      API_PATHS.rooms.review(reviewId),
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      {
        successMessage: ROOM_API_SUCCESS_MESSAGES.reviewUpdated,
      }
    );
  },

  async flagReview(reviewId: string) {
    assertReviewId(reviewId);

    return apiRequestJson<RoomReview>(
      API_PATHS.rooms.flagReview(reviewId),
      {
        method: "POST",
      },
      {
        successMessage: ROOM_API_SUCCESS_MESSAGES.reviewFlagged,
      }
    );
  },

  async getReviewEligibility(listingId: string) {
    assertListingId(listingId);
    return apiRequestJson<ReviewEligibility>(API_PATHS.rooms.reviewEligibility(listingId));
  },

  async getHomeActivities() {
    return apiRequestJson<{ content: RoomListingActivity[] }>(API_PATHS.rooms.homeActivities);
  },

  async getMyActivities() {
    return apiRequestJson<{ content: RoomListingActivity[] }>(API_PATHS.rooms.myActivities);
  },

  async saveListing(id: string, notes?: string) {
    assertListingId(id);

    const query = new URLSearchParams();
    if (notes?.trim()) {
      query.append("notes", notes);
    }

    return apiRequestJson<{ saved: boolean }>(
      withQuery(API_PATHS.rooms.saveListing(id), query.toString()),
      {
        method: "POST",
      },
      {
        successMessage: ROOM_API_SUCCESS_MESSAGES.listingSaved,
      }
    );
  },

  async unsaveListing(id: string) {
    assertListingId(id);

    return apiRequestJson<{ saved: boolean }>(
      API_PATHS.rooms.saveListing(id),
      {
        method: "DELETE",
      },
      {
        successMessage: ROOM_API_SUCCESS_MESSAGES.listingUnsaved,
      }
    );
  },

  async isSaved(id: string) {
    assertListingId(id);
    return apiRequestJson<{ saved: boolean }>(API_PATHS.rooms.listingSavedStatus(id));
  },

  async getSavedListings(filters: RoomFilters = {}) {
    const query = buildQuery(filters);
    return apiRequestJson<{ content: RoomListingSummary[] }>(
      withQuery(API_PATHS.rooms.savedListings, query)
    );
  },

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
    return apiRequestJson<{ id: string }>(
      API_PATHS.rooms.alerts,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      {
        successMessage: ROOM_API_SUCCESS_MESSAGES.priceAlertCreated,
      }
    );
  },

  async getPriceAlerts() {
    return apiRequestJson<{ content: unknown[] }>(API_PATHS.rooms.alerts);
  },

  async deletePriceAlert(alertId: string) {
    assertAlertId(alertId);

    await apiRequestNoContent(
      API_PATHS.rooms.alert(alertId),
      {
        method: "DELETE",
      },
      {
        successMessage: ROOM_API_SUCCESS_MESSAGES.priceAlertDeleted,
      }
    );
  },

  async reportListing(id: string, reason: string, description?: string) {
    assertListingId(id);
    assertNonEmptyString(reason, ROOM_API_ERROR_MESSAGES.reportReasonRequired);

    return apiRequestJson<{ reported: boolean }>(
      API_PATHS.rooms.reportListing(id),
      {
        method: "POST",
        body: JSON.stringify({ reason, description }),
      },
      {
        successMessage: ROOM_API_SUCCESS_MESSAGES.listingReported,
      }
    );
  },
};
