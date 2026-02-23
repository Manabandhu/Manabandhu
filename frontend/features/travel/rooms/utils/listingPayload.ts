import type { RoomListingFormValues } from "@/features/travel/rooms/components/RoomListingForm";
import type { RoomListing } from "@/shared/types";

const splitCsv = (value: string): string[] =>
  value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const parseContactPreference = (
  value: string
): Record<string, unknown> | null => {
  if (!value.trim()) return null;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const validateRoomListingValues = (
  values: RoomListingFormValues
): string[] => {
  const errors: string[] = [];

  if (!values.title.trim()) {
    errors.push("Title is required");
  }
  if (!values.rentMonthly.trim() || Number.isNaN(Number(values.rentMonthly)) || Number(values.rentMonthly) <= 0) {
    errors.push("Valid rent amount is required");
  }
  if (!values.latApprox.trim() || Number.isNaN(Number(values.latApprox))) {
    errors.push("Approximate location (latitude) is required");
  }
  if (!values.lngApprox.trim() || Number.isNaN(Number(values.lngApprox))) {
    errors.push("Approximate location (longitude) is required");
  }
  if (!values.approxAreaLabel.trim()) {
    errors.push("Area label is required");
  }
  if (!values.listingFor) {
    errors.push("Listing type is required");
  }
  if (!values.roomType) {
    errors.push("Room type is required");
  }
  if (!values.visitType) {
    errors.push("Visit type is required");
  }
  if (values.locationExactEnabled) {
    if (!values.latExact.trim() || Number.isNaN(Number(values.latExact))) {
      errors.push("Exact location (latitude) is required when exact location is enabled");
    }
    if (!values.lngExact.trim() || Number.isNaN(Number(values.lngExact))) {
      errors.push("Exact location (longitude) is required when exact location is enabled");
    }
  }

  return errors;
};

export const buildRoomListingPayload = (
  values: RoomListingFormValues,
  imageUrls: string[]
): Partial<RoomListing> => {
  return {
    title: values.title.trim(),
    listingFor: values.listingFor,
    roomType: values.roomType,
    peopleAllowed: Number(values.peopleAllowed) || 1,
    rentMonthly: Number(values.rentMonthly),
    deposit: values.deposit ? Number(values.deposit) : null,
    leaseStartDate: values.leaseStartDate || null,
    leaseEndDate: values.leaseEndDate || null,
    leaseExtendable: values.leaseExtendable,
    utilitiesIncluded: values.utilitiesIncluded,
    utilities: splitCsv(values.utilities),
    amenities: splitCsv(values.amenities),
    visitType: values.visitType,
    contactPreference: parseContactPreference(values.contactPreference),
    description: values.description,
    locationExactEnabled: values.locationExactEnabled,
    latExact: values.locationExactEnabled && values.latExact ? Number(values.latExact) : null,
    lngExact: values.locationExactEnabled && values.lngExact ? Number(values.lngExact) : null,
    latApprox: Number(values.latApprox),
    lngApprox: Number(values.lngApprox),
    approxAreaLabel: values.approxAreaLabel,
    nearbyLocalities: splitCsv(values.nearbyLocalities),
    nearbySchools: splitCsv(values.nearbySchools),
    nearbyCompanies: splitCsv(values.nearbyCompanies),
    imageUrls,
  };
};
