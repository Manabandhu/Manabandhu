export type ListingFor = "STUDENT" | "COUPLE" | "PROFESSIONAL" | "FAMILY";
export type RoomType = "PRIVATE" | "SHARED" | "ENTIRE_UNIT";
export type VisitType = "VIDEO_CALL" | "IN_PERSON" | "BOTH";
export type ListingStatus = "AVAILABLE" | "IN_TALKS" | "BOOKED" | "HIDDEN" | "ARCHIVED" | "DELETED";

export interface RoomListing {
  id: string;
  ownerUserId: string;
  title: string;
  listingFor: ListingFor;
  roomType: RoomType;
  peopleAllowed: number;
  rentMonthly: number;
  deposit?: number | null;
  leaseStartDate?: string | null;
  leaseEndDate?: string | null;
  utilitiesIncluded: boolean;
  utilities: string[];
  amenities: string[];
  visitType: VisitType;
  contactPreference?: Record<string, unknown> | null;
  description?: string | null;
  locationExactEnabled: boolean;
  latExact?: number | null;
  lngExact?: number | null;
  latApprox: number;
  lngApprox: number;
  approxAreaLabel: string;
  nearbyLocalities: string[];
  nearbySchools: string[];
  nearbyCompanies: string[];
  imageUrls: string[];
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  hiddenAt?: string | null;
  owner: boolean;
  canReview: boolean;
}

export interface RoomListingSummary {
  id: string;
  title: string;
  listingFor: ListingFor;
  roomType: RoomType;
  rentMonthly: number;
  approxAreaLabel: string;
  latApprox: number;
  lngApprox: number;
  latExact?: number | null;
  lngExact?: number | null;
  locationExactEnabled: boolean;
  imageUrls: string[];
  status: ListingStatus;
  lastActivityAt: string;
}

export interface RoomFilters {
  minRent?: number;
  maxRent?: number;
  roomType?: RoomType;
  listingFor?: ListingFor;
  amenities?: string[];
  availableBy?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export interface RoomListingActivity {
  id: string;
  listingId: string;
  actorUserId: string;
  type: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export type ReviewType = "HOUSE" | "USER";

export interface RoomReview {
  id: string;
  listingId: string;
  reviewerUserId: string;
  revieweeUserId: string;
  type: ReviewType;
  rating: number;
  tags: string[];
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  edited: boolean;
  flagged: boolean;
}

export interface ReviewEligibility {
  eligible: boolean;
}
