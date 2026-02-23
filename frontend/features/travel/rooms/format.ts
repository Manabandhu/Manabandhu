import { ListingStatus, RoomType, ListingFor } from "@/shared/types/rooms";

export const formatRoomStatus = (status: ListingStatus): string => {
  switch (status) {
    case "AVAILABLE":
      return "Available";
    case "IN_TALKS":
      return "In Talks";
    case "BOOKED":
      return "Booked";
    case "HIDDEN":
      return "Hidden";
    case "ARCHIVED":
      return "Archived";
    case "DELETED":
      return "Deleted";
    default:
      return status;
  }
};

export const formatRoomType = (roomType: RoomType): string => {
  switch (roomType) {
    case "PRIVATE":
      return "Private Room";
    case "SHARED":
      return "Shared Room";
    case "ENTIRE_UNIT":
      return "Entire Unit";
    default:
      return roomType;
  }
};

export const formatListingFor = (listingFor: ListingFor): string => {
  switch (listingFor) {
    case "STUDENT":
      return "Student";
    case "COUPLE":
      return "Couple";
    case "PROFESSIONAL":
      return "Professional";
    case "FAMILY":
      return "Family";
    default:
      return listingFor;
  }
};


