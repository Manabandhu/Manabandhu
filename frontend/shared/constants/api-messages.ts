export const ROOM_API_ERROR_MESSAGES = {
  listingIdRequired: "Listing ID is required",
  titleRequired: "Title is required",
  validRentRequired: "Valid rent amount is required",
  locationRequired: "Location is required",
  areaLabelRequired: "Area label is required",
  listingTypeRequired: "Listing type is required",
  roomTypeRequired: "Room type is required",
  visitTypeRequired: "Visit type is required",
  statusRequired: "Status is required",
  chatThreadIdRequired: "Chat thread ID is required",
  reviewIdRequired: "Review ID is required",
  ratingRange: "Rating must be between 1 and 5",
  alertIdRequired: "Alert ID is required",
  reportReasonRequired: "Report reason is required",
  unexpectedCreateListing: "An unexpected error occurred while creating the listing",
} as const;

export const ROOM_API_SUCCESS_MESSAGES = {
  listingCreated: "Room listing created successfully!",
  listingUpdated: "Room listing updated successfully!",
  listingDeleted: "Room listing deleted successfully!",
  listingReposted: "Room listing reposted successfully!",
  listingStatusUpdated: "Listing status updated successfully!",
  chatStarted: "Chat started successfully!",
  reviewSubmitted: "Review submitted successfully!",
  reviewUpdated: "Review updated successfully!",
  reviewFlagged: "Review flagged successfully!",
  listingSaved: "Listing saved!",
  listingUnsaved: "Listing removed from saved",
  priceAlertCreated: "Price alert created!",
  priceAlertDeleted: "Price alert deleted!",
  listingReported: "Thank you for reporting. We will review this listing.",
} as const;

export const ROOM_API_CONSTRAINTS = {
  minReviewRating: 1,
  maxReviewRating: 5,
} as const;

export const RIDE_API_ERROR_MESSAGES = {
  rideIdRequired: "Ride ID is required",
  chatThreadIdRequired: "Chat thread ID is required",
  statusRequired: "Status is required",
  fetchRides: "Failed to fetch rides",
  fetchRide: "Failed to fetch ride",
  createRide: "Failed to create ride",
  updateRide: "Failed to update ride",
  cancelRide: "Failed to cancel ride",
  repostRide: "Failed to repost ride",
  rebookRide: "Failed to rebook ride",
  updateRideStatus: "Failed to update status",
  startRideChat: "Failed to start chat",
  recordRideHeartbeat: "Failed to record heartbeat",
  bookRide: "Failed to book ride",
  startTracking: "Failed to start tracking",
  updateTrackingLocation: "Failed to update location",
  fetchTracking: "Failed to fetch tracking",
  endTracking: "Failed to end tracking",
  fetchRideActivities: "Failed to fetch activities",
} as const;

export const COMMUNITY_API_ERROR_MESSAGES = {
  fetchPosts: "Failed to fetch posts",
  fetchUserPosts: "Failed to fetch user posts",
  createPost: "Failed to create post",
  likePost: "Failed to like post",
  deletePost: "Failed to delete post",
  updatePost: "Failed to update post",
  fetchComments: "Failed to fetch comments",
  addComment: "Failed to add comment",
  deleteComment: "Failed to delete comment",
} as const;

export const JOBS_API_ERROR_MESSAGES = {
  fetchJobs: "Failed to fetch jobs",
  searchJobs: "Failed to search jobs",
  fetchJobsByType: "Failed to fetch jobs by type",
  fetchJob: "Failed to fetch job",
  fetchUserJobs: "Failed to fetch user jobs",
  createJob: "Failed to create job",
  deleteJob: "Failed to delete job",
} as const;

export const CHAT_API_ERROR_MESSAGES = {
  fetchChats: "Failed to fetch chats",
  createChat: "Failed to create chat",
  getOrCreateDirectChat: "Failed to get/create direct chat",
  fetchMessages: "Failed to fetch messages",
  sendMessage: "Failed to send message",
} as const;
