package com.manabandhu.modules.travel.rides.components.service;

import com.manabandhu.modules.travel.rides.components.dto.RidePostRequest;
import com.manabandhu.modules.travel.rides.components.model.RideConversationLink;
import com.manabandhu.modules.travel.rides.components.model.RidePost;
import com.manabandhu.modules.travel.rides.components.model.RidePostActivity;
import com.manabandhu.modules.travel.rides.components.model.RideRequest;
import com.manabandhu.repository.RideConversationLinkRepository;
import com.manabandhu.repository.RidePostActivityRepository;
import com.manabandhu.repository.RidePostRepository;
import com.manabandhu.repository.RideRequestRepository;
import com.manabandhu.service.ChatService;
import com.manabandhu.service.NotificationEventService;
import com.manabandhu.service.WebSocketService;
import com.manabandhu.modules.travel.rides.components.dto.RidePostResponse;
import com.manabandhu.modules.messaging.shared.dto.RideUpdateEvent;
import com.manabandhu.modules.messaging.notification.components.model.NotificationEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class RidePostService {
    private static final Duration MATCH_TIME_WINDOW = Duration.ofHours(2);
    private static final BigDecimal MATCH_DISTANCE_MILES = new BigDecimal("0.5");
    private static final BigDecimal EARTH_RADIUS_MILES = new BigDecimal("3958.8");
    private static final int EXPIRY_HOURS = 48;

    private final RidePostRepository ridePostRepository;
    private final RidePostActivityRepository activityRepository;
    private final RideConversationLinkRepository conversationLinkRepository;
    private final RideRequestRepository rideRequestRepository;
    private final RidePricingService pricingService;
    private final RoutingProvider routingProvider;
    private final RideTrackingService trackingService;
    private final ChatService chatService;
    private final NotificationEventService notificationEventService;
    private final WebSocketService webSocketService;

    public RidePostService(RidePostRepository ridePostRepository,
                           RidePostActivityRepository activityRepository,
                           RideConversationLinkRepository conversationLinkRepository,
                           RideRequestRepository rideRequestRepository,
                           RidePricingService pricingService,
                           RoutingProvider routingProvider,
                           RideTrackingService trackingService,
                           ChatService chatService,
                           NotificationEventService notificationEventService,
                           WebSocketService webSocketService) {
        this.ridePostRepository = ridePostRepository;
        this.activityRepository = activityRepository;
        this.conversationLinkRepository = conversationLinkRepository;
        this.rideRequestRepository = rideRequestRepository;
        this.pricingService = pricingService;
        this.routingProvider = routingProvider;
        this.trackingService = trackingService;
        this.chatService = chatService;
        this.notificationEventService = notificationEventService;
        this.webSocketService = webSocketService;
    }

    public RidePostUpsertResult createOrUpdate(String ownerUserId, RidePostRequest request) {
        validateRequest(request);
        Optional<RidePost> match = findMatchingPost(ownerUserId, request);
        if (match.isPresent()) {
            RidePost existing = match.get();
            if (existing.getStatus() == RidePost.Status.OPEN || existing.getStatus() == RidePost.Status.IN_TALKS) {
                RidePost updated = applyRequest(existing, request, false);
                updated.setLastActivityAt(LocalDateTime.now());
                ridePostRepository.save(updated);
                createActivity(updated, ownerUserId, RidePostActivity.ActivityType.UPDATED, Map.of("upsert", "updated"));
                
                // Publish WebSocket event
                publishRideUpdate("UPDATED", updated);
                
                return new RidePostUpsertResult(updated, RidePostUpsertResult.Action.UPDATED_EXISTING);
            }
            if (existing.getStatus() == RidePost.Status.BOOKED) {
                RidePost rebooked = applyRequest(new RidePost(), request, true);
                rebooked.setStatus(RidePost.Status.REBOOKED);
                rebooked.setOwnerUserId(ownerUserId);
                rebooked.setBookedByUserId(null);
                ridePostRepository.save(rebooked);
                createActivity(rebooked, ownerUserId, RidePostActivity.ActivityType.REBOOKED,
                        Map.of("previousPostId", existing.getId().toString()));
                
                // Publish WebSocket event
                publishRideUpdate("REBOOKED", rebooked);
                
                return new RidePostUpsertResult(rebooked, RidePostUpsertResult.Action.REBOOKED_FROM_BOOKED);
            }
        }
        RidePost created = applyRequest(new RidePost(), request, true);
        created.setOwnerUserId(ownerUserId);
        created.setStatus(RidePost.Status.OPEN);
        ridePostRepository.save(created);
        createActivity(created, ownerUserId, RidePostActivity.ActivityType.CREATED, Map.of("title", created.getTitle()));
        
        // Publish WebSocket event
        publishRideUpdate("CREATED", created);
        
        return new RidePostUpsertResult(created, RidePostUpsertResult.Action.CREATED);
    }

    public RidePost updatePost(String ownerUserId, UUID id, RidePostRequest request) {
        RidePost post = getOwnedPost(ownerUserId, id);
        validateRequest(request);
        RidePost updated = applyRequest(post, request, false);
        updated.setLastActivityAt(LocalDateTime.now());
        updated = ridePostRepository.save(updated);
        createActivity(updated, ownerUserId, RidePostActivity.ActivityType.UPDATED, Map.of("title", updated.getTitle()));
        
        // Publish WebSocket event
        publishRideUpdate("UPDATED", updated);
        
        return updated;
    }

    public void cancelPost(String ownerUserId, UUID id) {
        RidePost post = getOwnedPost(ownerUserId, id);
        if (post.getStatus() == RidePost.Status.CANCELLED) {
            return;
        }
        post.setStatus(RidePost.Status.CANCELLED);
        post.setLastActivityAt(LocalDateTime.now());
        ridePostRepository.save(post);
        trackingService.cancelTracking(id);
        createActivity(post, ownerUserId, RidePostActivity.ActivityType.CANCELLED, Map.of("title", post.getTitle()));
        
        // Publish WebSocket event
        publishRideUpdate("CANCELLED", post);
    }

    public RidePost repostPost(String ownerUserId, UUID id) {
        RidePost post = getOwnedPost(ownerUserId, id);
        RidePost.Status previous = post.getStatus();
        post.setStatus(RidePost.Status.OPEN);
        post.setBookedByUserId(null);
        LocalDateTime now = LocalDateTime.now();
        post.setCreatedAt(now);
        post.setUpdatedAt(now);
        post.setLastActivityAt(now);
        post.setExpiresAt(now.plusHours(EXPIRY_HOURS));
        post.setArchivedAt(null);
        RidePost saved = ridePostRepository.save(post);
        createActivity(saved, ownerUserId, RidePostActivity.ActivityType.STATUS_CHANGED,
                Map.of("from", previous.name(), "to", saved.getStatus().name()));
        
        // Publish WebSocket event
        publishRideUpdate("STATUS_CHANGED", saved);
        
        return saved;
    }

    public RidePost rebookPost(String ownerUserId, UUID id) {
        RidePost post = getOwnedPost(ownerUserId, id);
        RidePost newPost = clonePost(post);
        newPost.setStatus(RidePost.Status.REBOOKED);
        newPost.setBookedByUserId(null);
        ridePostRepository.save(newPost);
        createActivity(newPost, ownerUserId, RidePostActivity.ActivityType.REBOOKED,
                Map.of("previousPostId", post.getId().toString()));
        
        // Publish WebSocket event
        publishRideUpdate("REBOOKED", newPost);
        
        return newPost;
    }

    public RidePost updateStatus(String ownerUserId, UUID id, RidePost.Status status) {
        RidePost post = getOwnedPost(ownerUserId, id);
        if (status == RidePost.Status.BOOKED) {
            throw new IllegalArgumentException("Use booking endpoint");
        }
        RidePost.Status previous = post.getStatus();
        post.setStatus(status);
        post.setLastActivityAt(LocalDateTime.now());
        if (status == RidePost.Status.ARCHIVED) {
            post.setArchivedAt(LocalDateTime.now());
        }
        RidePost saved = ridePostRepository.save(post);
        createActivity(saved, ownerUserId, RidePostActivity.ActivityType.STATUS_CHANGED,
                Map.of("from", previous.name(), "to", status.name()));
        return saved;
    }

    public RidePost book(String userId, UUID id) {
        RidePost post = ridePostRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new NoSuchElementException("Ride post not found"));
        
        if (post.getStatus() != RidePost.Status.OPEN && post.getStatus() != RidePost.Status.IN_TALKS) {
            throw new IllegalStateException("Ride cannot be requested in current status");
        }
        
        if (post.getOwnerUserId().equals(userId)) {
            throw new IllegalArgumentException("Owner cannot request their own post");
        }
        
        // Check if user already has a request (any status)
        Optional<RideRequest> existingRequest = rideRequestRepository.findByRidePostIdAndRequestedByUserId(id, userId);
        if (existingRequest.isPresent()) {
            RideRequest request = existingRequest.get();
            if (request.getStatus() == RideRequest.RequestStatus.PENDING) {
                throw new IllegalStateException("You already have a pending request for this ride");
            }
            if (request.getStatus() == RideRequest.RequestStatus.ACCEPTED) {
                throw new IllegalStateException("You already have an accepted request for this ride");
            }
            // If request was rejected or cancelled, allow creating a new one by deleting the old one
            if (request.getStatus() == RideRequest.RequestStatus.REJECTED || 
                request.getStatus() == RideRequest.RequestStatus.CANCELLED) {
                rideRequestRepository.delete(request);
            }
        }
        
        // Create a new ride request
        // Use try-catch to handle potential race condition with unique constraint
        try {
            RideRequest rideRequest = new RideRequest();
            rideRequest.setRidePostId(id);
            rideRequest.setRequestedByUserId(userId);
            rideRequest.setStatus(RideRequest.RequestStatus.PENDING);
            rideRequestRepository.save(rideRequest);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Handle race condition: another request was created between check and save
            // Re-check to provide accurate error message
            Optional<RideRequest> duplicateRequest = rideRequestRepository.findByRidePostIdAndRequestedByUserId(id, userId);
            if (duplicateRequest.isPresent()) {
                RideRequest.RequestStatus status = duplicateRequest.get().getStatus();
                if (status == RideRequest.RequestStatus.PENDING) {
                    throw new IllegalStateException("You already have a pending request for this ride");
                } else if (status == RideRequest.RequestStatus.ACCEPTED) {
                    throw new IllegalStateException("You already have an accepted request for this ride");
                } else {
                    throw new IllegalStateException("A request for this ride already exists");
                }
            }
            // If we can't find it, re-throw the original exception
            throw new IllegalStateException("Unable to create request. A duplicate request may already exist.", e);
        }
        
        // Update post activity
        post.setLastActivityAt(LocalDateTime.now());
        RidePost saved = ridePostRepository.save(post);
        
        createActivity(saved, userId, RidePostActivity.ActivityType.BOOKED,
                Map.of("requestedBy", userId));
        
        // Publish WebSocket event
        publishRideUpdate("REQUESTED", saved);
        
        // Send notification to ride owner
        try {
            notificationEventService.createEvent(
                    post.getOwnerUserId(),
                    NotificationEvent.NotificationType.RIDE_REQUESTED,
                    Map.of(
                            "ridePostId", id.toString(),
                            "requestedBy", userId,
                            "pickupLabel", post.getPickupLabel() != null ? post.getPickupLabel() : "",
                            "dropLabel", post.getDropLabel() != null ? post.getDropLabel() : "",
                            "departAt", post.getDepartAt() != null ? post.getDepartAt().toString() : ""
                    )
            );
        } catch (Exception e) {
            // Log error but don't fail the request
            System.err.println("Failed to send ride request notification: " + e.getMessage());
        }
        
        return saved;
    }

    public RidePost getPost(UUID id, String userId) {
        RidePost post = ridePostRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Ride post not found"));
        if (post.getStatus() == RidePost.Status.CANCELLED || post.getStatus() == RidePost.Status.ARCHIVED) {
            if (!post.getOwnerUserId().equals(userId) && !Objects.equals(post.getBookedByUserId(), userId)) {
                throw new NoSuchElementException("Ride post not found");
            }
        }
        if (post.getStatus() == RidePost.Status.BOOKED) {
            if (!post.getOwnerUserId().equals(userId) && !Objects.equals(post.getBookedByUserId(), userId)) {
                throw new NoSuchElementException("Ride post not found");
            }
        }
        return post;
    }

    public Page<RidePost> getPosts(RidePostSearch search, Pageable pageable) {
        Specification<RidePost> spec = Specification.where(postTypeFilter(search))
                .and(statusFilter(search))
                .and(departRangeFilter(search))
                .and(priceRangeFilter(search))
                .and(seatsFilter(search))
                .and(radiusFilter(search))
                .and(requirementsFilter(search));
        return ridePostRepository.findAll(spec, pageable);
    }

    public Page<RidePost> getMyPosts(String ownerUserId, Pageable pageable) {
        return ridePostRepository.findByOwnerUserIdOrderByCreatedAtDesc(ownerUserId, pageable);
    }

    public String startChat(UUID postId, String currentUserId) {
        RidePost post = getPost(postId, currentUserId);
        if (post.getOwnerUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("Owner cannot start chat with themselves");
        }
        String chatThreadId = chatService.getOrCreateDirectChat(
            post.getOwnerUserId(), 
            currentUserId,
            com.manabandhu.model.chat.Chat.ChatContext.RIDE
        ).getId().toString();
        RideConversationLink link = conversationLinkRepository
                .findByRidePostIdAndOwnerUserIdAndOtherUserId(postId, post.getOwnerUserId(), currentUserId)
                .orElseGet(RideConversationLink::new);
        LocalDateTime now = LocalDateTime.now();
        link.setRidePostId(postId);
        link.setOwnerUserId(post.getOwnerUserId());
        link.setOtherUserId(currentUserId);
        link.setChatThreadId(chatThreadId);
        if (link.getStartedAt() == null) {
            link.setStartedAt(now);
        }
        link.setStatus(RideConversationLink.Status.ACTIVE);
        conversationLinkRepository.save(link);

        if (post.getStatus() == RidePost.Status.OPEN) {
            post.setStatus(RidePost.Status.IN_TALKS);
        }
        post.setLastActivityAt(now);
        ridePostRepository.save(post);
        createActivity(post, currentUserId, RidePostActivity.ActivityType.CHAT_STARTED, Map.of("chatThreadId", chatThreadId));
        return chatThreadId;
    }

    public void heartbeat(String chatThreadId) {
        RideConversationLink link = conversationLinkRepository.findByChatThreadId(chatThreadId)
                .orElseThrow(() -> new NoSuchElementException("Conversation link not found"));
        LocalDateTime now = LocalDateTime.now();
        link.setLastMessageAt(now);
        conversationLinkRepository.save(link);
        RidePost post = ridePostRepository.findById(link.getRidePostId())
                .orElseThrow(() -> new NoSuchElementException("Ride post not found"));
        post.setLastActivityAt(now);
        ridePostRepository.save(post);
    }

    public int autoArchiveExpiredPosts() {
        List<RidePost.Status> statuses = List.of(RidePost.Status.OPEN, RidePost.Status.IN_TALKS);
        List<RidePost> expired = ridePostRepository.findByStatusInAndExpiresAtBefore(statuses, LocalDateTime.now());
        LocalDateTime now = LocalDateTime.now();
        for (RidePost post : expired) {
            post.setStatus(RidePost.Status.ARCHIVED);
            post.setArchivedAt(now);
            post.setLastActivityAt(now);
            ridePostRepository.save(post);
            createActivity(post, post.getOwnerUserId(), RidePostActivity.ActivityType.AUTO_ARCHIVED,
                    Map.of("expiresAt", post.getExpiresAt().toString()));
        }
        return expired.size();
    }

    public Page<RidePostActivity> getHomeActivities(Pageable pageable) {
        return activityRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<RidePostActivity> getMyActivities(String userId, Pageable pageable) {
        return activityRepository.findByActorUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    private RidePost getOwnedPost(String ownerUserId, UUID id) {
        RidePost post = ridePostRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Ride post not found"));
        if (!post.getOwnerUserId().equals(ownerUserId)) {
            throw new IllegalArgumentException("Not authorized");
        }
        return post;
    }

    private void validateRequest(RidePostRequest request) {
        if (request.getPostType() == RidePost.PostType.OFFER && request.getSeatsTotal() == null) {
            throw new IllegalArgumentException("Seats total is required for offers");
        }
        if (request.getPostType() == RidePost.PostType.REQUEST && request.getSeatsNeeded() == null) {
            throw new IllegalArgumentException("Seats needed is required for requests");
        }
        if (request.getPostType() == RidePost.PostType.OFFER && request.getSeatsNeeded() != null) {
            throw new IllegalArgumentException("Seats needed is not applicable for offers");
        }
        if (request.getPostType() == RidePost.PostType.REQUEST && request.getSeatsTotal() != null) {
            throw new IllegalArgumentException("Seats total is not applicable for requests");
        }
    }

    private Optional<RidePost> findMatchingPost(String ownerUserId, RidePostRequest request) {
        List<RidePost> candidates = ridePostRepository.findByOwnerUserIdAndStatusIn(
                ownerUserId,
                List.of(RidePost.Status.OPEN, RidePost.Status.IN_TALKS, RidePost.Status.BOOKED)
        );
        return candidates.stream()
                .filter(candidate -> matches(candidate, request))
                .findFirst();
    }

    private boolean matches(RidePost candidate, RidePostRequest request) {
        if (candidate.getPostType() != request.getPostType()) {
            return false;
        }
        if (!equalsLabel(candidate.getPickupLabel(), request.getPickupLabel())) {
            return false;
        }
        if (!equalsLabel(candidate.getDropLabel(), request.getDropLabel())) {
            return false;
        }
        if (candidate.getDepartAt() != null && request.getDepartAt() != null) {
            Duration diff = Duration.between(candidate.getDepartAt(), request.getDepartAt()).abs();
            if (diff.compareTo(MATCH_TIME_WINDOW) > 0) {
                return false;
            }
        }
        BigDecimal pickupDistance = haversineMiles(candidate.getPickupLat(), candidate.getPickupLng(), request.getPickupLat(), request.getPickupLng());
        BigDecimal dropDistance = haversineMiles(candidate.getDropLat(), candidate.getDropLng(), request.getDropLat(), request.getDropLng());
        return pickupDistance.compareTo(MATCH_DISTANCE_MILES) <= 0 && dropDistance.compareTo(MATCH_DISTANCE_MILES) <= 0;
    }

    private boolean equalsLabel(String left, String right) {
        if (left == null || right == null) {
            return false;
        }
        return left.trim().equalsIgnoreCase(right.trim());
    }

    private BigDecimal haversineMiles(BigDecimal lat1, BigDecimal lng1, BigDecimal lat2, BigDecimal lng2) {
        double lat1Rad = Math.toRadians(lat1.doubleValue());
        double lat2Rad = Math.toRadians(lat2.doubleValue());
        double deltaLat = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double deltaLng = Math.toRadians(lng2.doubleValue() - lng1.doubleValue());
        double a = Math.pow(Math.sin(deltaLat / 2), 2)
                + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.pow(Math.sin(deltaLng / 2), 2);
        double c = 2 * Math.asin(Math.sqrt(a));
        return EARTH_RADIUS_MILES.multiply(BigDecimal.valueOf(c)).setScale(2, RoundingMode.HALF_UP);
    }

    private RidePost applyRequest(RidePost post, RidePostRequest request, boolean resetTimestamps) {
        RoutingProvider.RouteResult route = routingProvider.calculateRoute(
                request.getPickupLat(),
                request.getPickupLng(),
                request.getDropLat(),
                request.getDropLng()
        );
        RidePricingService.PricingResult pricing = pricingService.computePricing(request, route.distanceMiles());
        LocalDateTime now = LocalDateTime.now();
        if (resetTimestamps) {
            post.setCreatedAt(now);
            post.setUpdatedAt(now);
            post.setExpiresAt(now.plusHours(EXPIRY_HOURS));
            post.setLastActivityAt(now);
        } else {
            post.setUpdatedAt(now);
        }
        post.setPostType(request.getPostType());
        post.setTitle(request.getTitle());
        post.setPickupLat(request.getPickupLat());
        post.setPickupLng(request.getPickupLng());
        post.setPickupLabel(request.getPickupLabel());
        post.setDropLat(request.getDropLat());
        post.setDropLng(request.getDropLng());
        post.setDropLabel(request.getDropLabel());
        post.setRouteDistanceMiles(route.distanceMiles());
        post.setRoutePolyline(route.polyline());
        post.setDepartAt(request.getDepartAt());
        post.setSeatsTotal(request.getSeatsTotal());
        post.setSeatsNeeded(request.getSeatsNeeded());
        post.setRequirements(requirementsToMap(request.getRequirements()));
        post.setPricingMode(pricing.pricingMode());
        post.setPriceFixed(pricing.priceFixed());
        post.setPricePerMile(pricing.pricePerMile());
        post.setPriceTotal(pricing.priceTotal());
        return post;
    }

    private Map<String, Object> requirementsToMap(com.manabandhu.dto.rides.RideRequirements requirements) {
        if (requirements == null) {
            return null;
        }
        Map<String, Object> map = new HashMap<>();
        if (requirements.getPeopleCount() != null) {
            map.put("peopleCount", requirements.getPeopleCount());
        }
        if (requirements.getLuggage() != null) {
            map.put("luggage", requirements.getLuggage());
        }
        if (requirements.getPets() != null) {
            map.put("pets", requirements.getPets());
        }
        if (requirements.getNotes() != null) {
            map.put("notes", requirements.getNotes());
        }
        return map.isEmpty() ? null : map;
    }

    private RidePost clonePost(RidePost original) {
        RidePost copy = new RidePost();
        copy.setPostType(original.getPostType());
        copy.setOwnerUserId(original.getOwnerUserId());
        copy.setTitle(original.getTitle());
        copy.setPickupLat(original.getPickupLat());
        copy.setPickupLng(original.getPickupLng());
        copy.setPickupLabel(original.getPickupLabel());
        copy.setDropLat(original.getDropLat());
        copy.setDropLng(original.getDropLng());
        copy.setDropLabel(original.getDropLabel());
        copy.setRouteDistanceMiles(original.getRouteDistanceMiles());
        copy.setRoutePolyline(original.getRoutePolyline());
        copy.setDepartAt(original.getDepartAt());
        copy.setSeatsTotal(original.getSeatsTotal());
        copy.setSeatsNeeded(original.getSeatsNeeded());
        copy.setRequirements(original.getRequirements());
        copy.setPricingMode(original.getPricingMode());
        copy.setPriceFixed(original.getPriceFixed());
        copy.setPricePerMile(original.getPricePerMile());
        copy.setPriceTotal(original.getPriceTotal());
        LocalDateTime now = LocalDateTime.now();
        copy.setCreatedAt(now);
        copy.setUpdatedAt(now);
        copy.setLastActivityAt(now);
        copy.setExpiresAt(now.plusHours(EXPIRY_HOURS));
        return copy;
    }

    private void createActivity(RidePost post, String actorUserId, RidePostActivity.ActivityType type, Map<String, Object> metadata) {
        RidePostActivity activity = new RidePostActivity();
        activity.setRidePostId(post.getId());
        activity.setActorUserId(actorUserId);
        activity.setType(type);
        activity.setMetadata(metadata);
        activity.setCreatedAt(LocalDateTime.now());
        activityRepository.save(activity);
    }

    private Specification<RidePost> postTypeFilter(RidePostSearch search) {
        return (root, query, cb) -> search.postType == null ? cb.conjunction() : cb.equal(root.get("postType"), search.postType);
    }

    private Specification<RidePost> statusFilter(RidePostSearch search) {
        if (search.statuses == null || search.statuses.isEmpty()) {
            return (root, query, cb) -> cb.and(
                    root.get("status").in(List.of(RidePost.Status.OPEN, RidePost.Status.IN_TALKS))
            );
        }
        return (root, query, cb) -> root.get("status").in(search.statuses);
    }

    private Specification<RidePost> departRangeFilter(RidePostSearch search) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (search.departAfter != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("departAt"), search.departAfter));
            }
            if (search.departBefore != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("departAt"), search.departBefore));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private Specification<RidePost> priceRangeFilter(RidePostSearch search) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (search.minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("priceTotal"), search.minPrice));
            }
            if (search.maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("priceTotal"), search.maxPrice));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private Specification<RidePost> seatsFilter(RidePostSearch search) {
        if (search.seats == null) {
            return (root, query, cb) -> cb.conjunction();
        }
        return (root, query, cb) -> cb.or(
                cb.and(cb.equal(root.get("postType"), RidePost.PostType.OFFER),
                        cb.greaterThanOrEqualTo(root.get("seatsTotal"), search.seats)),
                cb.and(cb.equal(root.get("postType"), RidePost.PostType.REQUEST),
                        cb.greaterThanOrEqualTo(root.get("seatsNeeded"), search.seats))
        );
    }

    private Specification<RidePost> radiusFilter(RidePostSearch search) {
        if (search.minLat == null || search.maxLat == null || search.minLng == null || search.maxLng == null) {
            return (root, query, cb) -> cb.conjunction();
        }
        return (root, query, cb) -> cb.and(
                cb.between(root.get("pickupLat"), search.minLat, search.maxLat),
                cb.between(root.get("pickupLng"), search.minLng, search.maxLng)
        );
    }

    private Specification<RidePost> requirementsFilter(RidePostSearch search) {
        if (search.luggage == null && search.pets == null) {
            return (root, query, cb) -> cb.conjunction();
        }
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (Boolean.TRUE.equals(search.luggage)) {
                predicates.add(cb.like(root.get("requirements").as(String.class), "%\"luggage\":true%"));
            }
            if (Boolean.TRUE.equals(search.pets)) {
                predicates.add(cb.like(root.get("requirements").as(String.class), "%\"pets\":true%"));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private void publishRideUpdate(String action, RidePost post) {
        try {
            RidePostResponse response = new RidePostResponse(post);
            RideUpdateEvent event = new RideUpdateEvent(action, response);
            webSocketService.broadcastRideUpdate(event);
        } catch (Exception e) {
            // Log but don't fail the operation if WebSocket publishing fails
            // This ensures the main operation (saving ride) still succeeds
        }
    }

    public record RidePostUpsertResult(RidePost post, Action action) {
        public enum Action {
            CREATED,
            UPDATED_EXISTING,
            REBOOKED_FROM_BOOKED
        }
    }

    public static class RidePostSearch {
        private final RidePost.PostType postType;
        private final List<RidePost.Status> statuses;
        private final LocalDateTime departAfter;
        private final LocalDateTime departBefore;
        private final BigDecimal minPrice;
        private final BigDecimal maxPrice;
        private final Integer seats;
        private final BigDecimal minLat;
        private final BigDecimal maxLat;
        private final BigDecimal minLng;
        private final BigDecimal maxLng;
        private final Boolean luggage;
        private final Boolean pets;

        public RidePostSearch(RidePost.PostType postType,
                              List<RidePost.Status> statuses,
                              LocalDateTime departAfter,
                              LocalDateTime departBefore,
                              BigDecimal minPrice,
                              BigDecimal maxPrice,
                              Integer seats,
                              BigDecimal minLat,
                              BigDecimal maxLat,
                              BigDecimal minLng,
                              BigDecimal maxLng,
                              Boolean luggage,
                              Boolean pets) {
            this.postType = postType;
            this.statuses = statuses;
            this.departAfter = departAfter;
            this.departBefore = departBefore;
            this.minPrice = minPrice;
            this.maxPrice = maxPrice;
            this.seats = seats;
            this.minLat = minLat;
            this.maxLat = maxLat;
            this.minLng = minLng;
            this.maxLng = maxLng;
            this.luggage = luggage;
            this.pets = pets;
        }
    }
}
