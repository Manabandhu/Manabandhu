import { RideStatus } from "@/shared/types";

export const formatRideStatus = (status: RideStatus) => {
  switch (status) {
    case "OPEN":
      return "Open";
    case "IN_TALKS":
      return "In Talks";
    case "BOOKED":
      return "Booked";
    case "REBOOKED":
      return "Rebooked";
    case "CANCELLED":
      return "Cancelled";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
};

export const hoursUntil = (dateString?: string) => {
  if (!dateString) return null;
  const target = new Date(dateString).getTime();
  const now = Date.now();
  const diffMs = target - now;
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
};

export const formatDepartTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
