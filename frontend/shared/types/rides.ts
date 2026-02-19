export type RidePostType = "OFFER" | "REQUEST";
export type RideStatus = "OPEN" | "IN_TALKS" | "BOOKED" | "REBOOKED" | "CANCELLED" | "ARCHIVED";
export type PricingMode = "FIXED" | "PER_MILE";

export interface RideRequirements {
  peopleCount?: number;
  luggage?: boolean;
  pets?: boolean;
  notes?: string;
}

export interface RidePostBase {
  id: string;
  postType: RidePostType;
  title?: string | null;
  pickupLat: number;
  pickupLng: number;
  pickupLabel: string;
  dropLat: number;
  dropLng: number;
  dropLabel: string;
  routeDistanceMiles: number;
  routePolyline?: string | null;
  departAt: string;
  seatsTotal?: number | null;
  seatsNeeded?: number | null;
  requirements?: RideRequirements | null;
  pricingMode: PricingMode;
  priceFixed?: number | null;
  pricePerMile?: number | null;
  priceTotal: number;
  status: RideStatus;
  expiresAt: string;
}

export interface RidePost extends RidePostBase {
  ownerUserId: string;
  bookedByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  archivedAt?: string | null;
  requestCount?: number | null;
}

export interface RidePostSummary extends RidePostBase {}

export type RideUpsertAction = "CREATED" | "UPDATED_EXISTING" | "REBOOKED_FROM_BOOKED";

export interface RidePostUpsertResponse {
  post: RidePost;
  action: RideUpsertAction;
}

export interface RideFilters {
  type?: RidePostType;
  departAfter?: string;
  departBefore?: string;
  seats?: number;
  minPrice?: number;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  radiusMiles?: number;
  luggage?: boolean;
  pets?: boolean;
  status?: RideStatus[];
}

export type RideActivityType =
  | "CREATED"
  | "UPDATED"
  | "CHAT_STARTED"
  | "STATUS_CHANGED"
  | "BOOKED"
  | "REBOOKED"
  | "CANCELLED"
  | "AUTO_ARCHIVED"
  | "LOCATION_SHARED";

export interface RidePostActivity {
  id: string;
  ridePostId: string;
  actorUserId: string;
  type: RideActivityType;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export type RideTrackingStatus = "ACTIVE" | "ENDED" | "CANCELLED";

export interface RideTrackingSession {
  id: string;
  ridePostId: string;
  driverUserId: string;
  riderUserId: string;
  status: RideTrackingStatus;
  startedAt: string;
  endedAt?: string | null;
  lastLocationAt?: string | null;
  lastLat?: number | null;
  lastLng?: number | null;
  etaMinutes?: number | null;
  distanceRemainingMiles?: number | null;
}
