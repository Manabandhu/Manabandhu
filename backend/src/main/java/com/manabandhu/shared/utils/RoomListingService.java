package com.manabandhu.shared.utils;

import com.manabandhu.modules.travel.rooms.components.dto.RoomListingRequest;
import com.manabandhu.core.exception.ResourceNotFoundException;
import com.manabandhu.core.exception.UnauthorizedException;
import com.manabandhu.core.exception.ValidationException;
import com.manabandhu.modules.messaging.notification.components.model.NotificationEvent;
import com.manabandhu.modules.travel.rooms.components.model.ConversationLink;
import com.manabandhu.modules.travel.rooms.components.model.RoomListing;
import com.manabandhu.modules.travel.rooms.components.model.RoomListingActivity;
import com.manabandhu.repository.ConversationLinkRepository;
import com.manabandhu.repository.RoomListingActivityRepository;
import com.manabandhu.repository.RoomListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class RoomListingService {
    private final RoomListingRepository roomListingRepository;
    private final RoomListingActivityRepository activityRepository;
    private final ConversationLinkRepository conversationLinkRepository;
    private final ChatService chatService;
    private final NotificationEventService notificationEventService;

    public RoomListing createListing(String ownerUserId, RoomListingRequest request) {
        try {
            if (!StringUtils.hasText(ownerUserId)) {
                throw new UnauthorizedException("User authentication required");
            }
            
            validateListingRequest(request);
            validateLocation(request);
            
            RoomListing listing = new RoomListing();
            listing.setOwnerUserId(ownerUserId);
            applyRequest(listing, request);
            listing.setStatus(RoomListing.Status.AVAILABLE);
            LocalDateTime now = LocalDateTime.now();
            listing.setCreatedAt(now);
            listing.setUpdatedAt(now);
            listing.setLastActivityAt(now);
            
            listing = roomListingRepository.save(listing);
            log.info("Room listing created with ID: {} by user: {}", listing.getId(), ownerUserId);
            
            createActivity(listing, ownerUserId, RoomListingActivity.ActivityType.CREATED, 
                Map.of("title", listing.getTitle()));
            return listing;
        } catch (Exception e) {
            log.error("Error creating room listing for user {}: {}", ownerUserId, e.getMessage(), e);
            throw e;
        }
    }

    public RoomListing updateListing(String userId, UUID listingId, RoomListingRequest request) {
        try {
            if (!StringUtils.hasText(userId)) {
                throw new UnauthorizedException("User authentication required");
            }
            if (listingId == null) {
                throw new ValidationException("Listing ID is required");
            }
            
            validateListingRequest(request);
            validateLocation(request);
            
            RoomListing listing = getOwnedListing(userId, listingId);
            applyRequest(listing, request);
            listing.setLastActivityAt(LocalDateTime.now());
            
            listing = roomListingRepository.save(listing);
            log.info("Room listing updated: {} by user: {}", listingId, userId);
            
            createActivity(listing, userId, RoomListingActivity.ActivityType.UPDATED, 
                Map.of("title", listing.getTitle()));
            return listing;
        } catch (Exception e) {
            log.error("Error updating room listing {} for user {}: {}", listingId, userId, e.getMessage(), e);
            throw e;
        }
    }

    public RoomListing getListing(UUID listingId) {
        try {
            if (listingId == null) {
                throw new ValidationException("Listing ID is required");
            }
            
            return roomListingRepository.findById(listingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Room listing not found with ID: " + listingId));
        } catch (Exception e) {
            log.error("Error fetching room listing {}: {}", listingId, e.getMessage(), e);
            throw e;
        }
    }

    public Page<RoomListing> getListings(RoomListingSearch search, Pageable pageable) {
        try {
            if (search == null) {
                search = new RoomListingSearch(null, null, null, null, null, null, null, null, null, null, null, false);
            }
            
            Specification<RoomListing> spec = Specification.where(statusFilter(search))
                    .and(priceFilter(search))
                    .and(roomTypeFilter(search))
                    .and(listingForFilter(search))
                    .and(amenitiesFilter(search))
                    .and(availabilityFilter(search))
                    .and(boundingBoxFilter(search));
            return roomListingRepository.findAll(spec, pageable);
        } catch (Exception e) {
            log.error("Error fetching room listings: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch room listings", e);
        }
    }

    public Page<RoomListing> getMyListings(String ownerUserId, Pageable pageable) {
        try {
            if (!StringUtils.hasText(ownerUserId)) {
                throw new ValidationException("Owner user ID is required");
            }
            
            Page<RoomListing> page = roomListingRepository.findByOwnerUserIdOrderByCreatedAtDesc(ownerUserId, pageable);
            List<RoomListing> filtered = page.getContent().stream()
                    .filter(listing -> listing.getStatus() != RoomListing.Status.DELETED)
                    .collect(Collectors.toList());
            return new org.springframework.data.domain.PageImpl<>(filtered, pageable, page.getTotalElements());
        } catch (Exception e) {
            log.error("Error fetching listings for user {}: {}", ownerUserId, e.getMessage(), e);
            throw e;
        }
    }

    public RoomListing updateStatus(String userId, UUID listingId, RoomListing.Status status) {
        try {
            if (!StringUtils.hasText(userId)) {
                throw new UnauthorizedException("User authentication required");
            }
            if (listingId == null) {
                throw new ValidationException("Listing ID is required");
            }
            if (status == null) {
                throw new ValidationException("Status is required");
            }
            
            RoomListing listing = getOwnedListing(userId, listingId);
            RoomListing.Status previous = listing.getStatus();
            listing.setStatus(status);
            listing.setLastActivityAt(LocalDateTime.now());
            
            if (status == RoomListing.Status.HIDDEN) {
                listing.setHiddenAt(LocalDateTime.now());
            } else {
                listing.setHiddenAt(null);
            }
            
            RoomListing saved = roomListingRepository.save(listing);
            log.info("Room listing status updated: {} from {} to {} by user: {}", listingId, previous, status, userId);
            
            createActivity(saved, userId, RoomListingActivity.ActivityType.STATUS_CHANGED,
                    Map.of("from", previous.name(), "to", status.name()));
            return saved;
        } catch (Exception e) {
            log.error("Error updating status for listing {} by user {}: {}", listingId, userId, e.getMessage(), e);
            throw e;
        }
    }

    public RoomListing repostListing(String userId, UUID listingId) {
        try {
            if (!StringUtils.hasText(userId)) {
                throw new UnauthorizedException("User authentication required");
            }
            if (listingId == null) {
                throw new ValidationException("Listing ID is required");
            }
            
            RoomListing listing = getOwnedListing(userId, listingId);
            LocalDateTime now = LocalDateTime.now();
            listing.setStatus(RoomListing.Status.AVAILABLE);
            listing.setHiddenAt(null);
            listing.setCreatedAt(now);
            listing.setLastActivityAt(now);
            
            listing = roomListingRepository.save(listing);
            log.info("Room listing reposted: {} by user: {}", listingId, userId);
            
            createActivity(listing, userId, RoomListingActivity.ActivityType.REPOSTED, 
                Map.of("title", listing.getTitle()));
            return listing;
        } catch (Exception e) {
            log.error("Error reposting listing {} by user {}: {}", listingId, userId, e.getMessage(), e);
            throw e;
        }
    }

    public void deleteListing(String userId, UUID listingId) {
        try {
            if (!StringUtils.hasText(userId)) {
                throw new UnauthorizedException("User authentication required");
            }
            if (listingId == null) {
                throw new ValidationException("Listing ID is required");
            }
            
            RoomListing listing = getOwnedListing(userId, listingId);
            listing.setStatus(RoomListing.Status.DELETED);
            listing.setLastActivityAt(LocalDateTime.now());
            
            roomListingRepository.save(listing);
            log.info("Room listing deleted: {} by user: {}", listingId, userId);
            
            createActivity(listing, userId, RoomListingActivity.ActivityType.DELETED, 
                Map.of("title", listing.getTitle()));
        } catch (Exception e) {
            log.error("Error deleting listing {} by user {}: {}", listingId, userId, e.getMessage(), e);
            throw e;
        }
    }

    public String startChat(UUID listingId, String currentUserId) {
        try {
            if (listingId == null) {
                throw new ValidationException("Listing ID is required");
            }
            if (!StringUtils.hasText(currentUserId)) {
                throw new UnauthorizedException("User authentication required");
            }
            
            RoomListing listing = getListing(listingId);
            if (listing.getStatus() == RoomListing.Status.DELETED) {
                throw new ResourceNotFoundException("Listing not found");
            }
            if (listing.getOwnerUserId().equals(currentUserId)) {
                throw new ValidationException("Cannot start chat with yourself");
            }
            
            String chatThreadId = chatService.getOrCreateDirectChat(
                listing.getOwnerUserId(), 
                currentUserId, 
                com.manabandhu.model.chat.Chat.ChatContext.ROOM
            ).getId().toString();
            ConversationLink link = conversationLinkRepository
                    .findByListingIdAndOwnerUserIdAndOtherUserId(listingId, listing.getOwnerUserId(), currentUserId)
                    .orElseGet(ConversationLink::new);
            
            LocalDateTime now = LocalDateTime.now();
            link.setListingId(listingId);
            link.setOwnerUserId(listing.getOwnerUserId());
            link.setOtherUserId(currentUserId);
            link.setChatThreadId(chatThreadId);
            if (link.getStartedAt() == null) {
                link.setStartedAt(now);
            }
            link.setStatus(ConversationLink.Status.ACTIVE);
            conversationLinkRepository.save(link);

            if (listing.getStatus() == RoomListing.Status.AVAILABLE) {
                listing.setStatus(RoomListing.Status.IN_TALKS);
            }
            listing.setLastActivityAt(now);
            roomListingRepository.save(listing);
            
            log.info("Chat started for listing {} by user {}", listingId, currentUserId);
            createActivity(listing, currentUserId, RoomListingActivity.ActivityType.CHAT_STARTED, 
                Map.of("chatThreadId", chatThreadId));
            return chatThreadId;
        } catch (Exception e) {
            log.error("Error starting chat for listing {} by user {}: {}", listingId, currentUserId, e.getMessage(), e);
            throw e;
        }
    }

    public void heartbeat(String chatThreadId) {
        try {
            if (!StringUtils.hasText(chatThreadId)) {
                throw new ValidationException("Chat thread ID is required");
            }
            
            ConversationLink link = conversationLinkRepository.findByChatThreadId(chatThreadId)
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation link not found"));
            
            LocalDateTime now = LocalDateTime.now();
            link.setLastMessageAt(now);
            conversationLinkRepository.save(link);
            
            RoomListing listing = getListing(link.getListingId());
            listing.setLastActivityAt(now);
            roomListingRepository.save(listing);
        } catch (Exception e) {
            log.warn("Error recording heartbeat for chat {}: {}", chatThreadId, e.getMessage());
            // Don't throw exception for heartbeat failures
        }
    }

    public int autoHideInactiveListings(LocalDateTime cutoff) {
        try {
            List<RoomListing.Status> statuses = List.of(RoomListing.Status.AVAILABLE, RoomListing.Status.IN_TALKS);
            List<RoomListing> inactive = roomListingRepository.findByStatusInAndLastActivityAtBefore(statuses, cutoff);
            
            LocalDateTime now = LocalDateTime.now();
            for (RoomListing listing : inactive) {
                listing.setStatus(RoomListing.Status.HIDDEN);
                listing.setHiddenAt(now);
                listing.setLastActivityAt(now);
                roomListingRepository.save(listing);
                
                createActivity(listing, listing.getOwnerUserId(), RoomListingActivity.ActivityType.AUTO_HIDDEN,
                        Map.of("reason", "inactivity"));
                        
                try {
                    notificationEventService.createEvent(
                            listing.getOwnerUserId(),
                            NotificationEvent.NotificationType.LISTING_HIDDEN_DUE_TO_INACTIVITY,
                            Map.of("listingId", listing.getId().toString(), "title", listing.getTitle())
                    );
                } catch (Exception e) {
                    log.warn("Failed to create notification for auto-hidden listing {}: {}", listing.getId(), e.getMessage());
                }
            }
            
            log.info("Auto-hidden {} inactive listings", inactive.size());
            return inactive.size();
        } catch (Exception e) {
            log.error("Error auto-hiding inactive listings: {}", e.getMessage(), e);
            return 0;
        }
    }

    public List<UUID> getListingIdsForOwner(String ownerUserId) {
        try {
            if (!StringUtils.hasText(ownerUserId)) {
                throw new ValidationException("Owner user ID is required");
            }
            
            return roomListingRepository.findByOwnerUserIdOrderByCreatedAtDesc(ownerUserId, Pageable.unpaged())
                    .stream()
                    .map(RoomListing::getId)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching listing IDs for owner {}: {}", ownerUserId, e.getMessage(), e);
            throw e;
        }
    }

    private void validateListingRequest(RoomListingRequest request) {
        if (request == null) {
            throw new ValidationException("Listing request is required");
        }
        if (!StringUtils.hasText(request.getTitle()) || request.getTitle().trim().length() < 5) {
            throw new ValidationException("Title must be at least 5 characters");
        }
        if (request.getRentMonthly() == null || request.getRentMonthly().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Valid monthly rent is required");
        }
        if (request.getListingFor() == null) {
            throw new ValidationException("Listing type is required");
        }
        if (request.getRoomType() == null) {
            throw new ValidationException("Room type is required");
        }
    }

    private void applyRequest(RoomListing listing, RoomListingRequest request) {
        listing.setTitle(request.getTitle());
        listing.setListingFor(request.getListingFor());
        listing.setRoomType(request.getRoomType());
        listing.setPeopleAllowed(request.getPeopleAllowed());
        listing.setRentMonthly(request.getRentMonthly());
        listing.setDeposit(request.getDeposit());
        listing.setLeaseStartDate(request.getLeaseStartDate());
        listing.setLeaseEndDate(request.getLeaseEndDate());
        listing.setLeaseExtendable(request.isLeaseExtendable());
        listing.setUtilitiesIncluded(request.isUtilitiesIncluded());
        listing.setUtilities(new ArrayList<>(Optional.ofNullable(request.getUtilities()).orElseGet(List::of)));
        listing.setAmenities(new ArrayList<>(Optional.ofNullable(request.getAmenities()).orElseGet(List::of)));
        listing.setVisitType(request.getVisitType());
        listing.setContactPreference(request.getContactPreference());
        listing.setDescription(request.getDescription());
        listing.setLocationExactEnabled(request.isLocationExactEnabled());
        listing.setLatExact(request.getLatExact());
        listing.setLngExact(request.getLngExact());
        listing.setLatApprox(request.getLatApprox());
        listing.setLngApprox(request.getLngApprox());
        listing.setApproxAreaLabel(request.getApproxAreaLabel());
        listing.setNearbyLocalities(new ArrayList<>(Optional.ofNullable(request.getNearbyLocalities()).orElseGet(List::of)));
        listing.setNearbySchools(new ArrayList<>(Optional.ofNullable(request.getNearbySchools()).orElseGet(List::of)));
        listing.setNearbyCompanies(new ArrayList<>(Optional.ofNullable(request.getNearbyCompanies()).orElseGet(List::of)));
        listing.setImageUrls(new ArrayList<>(Optional.ofNullable(request.getImageUrls()).orElseGet(List::of)));
    }

    private void validateLocation(RoomListingRequest request) {
        if (request.isLocationExactEnabled()) {
            if (request.getLatExact() == null || request.getLngExact() == null) {
                throw new ValidationException("Exact coordinates are required when exact location is enabled");
            }
        }
        if (request.getLatApprox() == null || request.getLngApprox() == null) {
            throw new ValidationException("Approximate location coordinates are required");
        }
    }

    private RoomListing getOwnedListing(String userId, UUID listingId) {
        RoomListing listing = getListing(listingId);
        if (!listing.getOwnerUserId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to modify this listing");
        }
        return listing;
    }

    private void createActivity(RoomListing listing, String actorUserId, RoomListingActivity.ActivityType type, Map<String, Object> metadata) {
        try {
            RoomListingActivity activity = new RoomListingActivity();
            activity.setListingId(listing.getId());
            activity.setActorUserId(actorUserId);
            activity.setType(type);
            activity.setMetadata(metadata);
            activityRepository.save(activity);
        } catch (Exception e) {
            log.warn("Failed to create activity for listing {}: {}", listing.getId(), e.getMessage());
            // Don't fail the main operation if activity creation fails
        }
    }

    // Filter methods remain the same...
    private Specification<RoomListing> statusFilter(RoomListingSearch search) {
        List<RoomListing.Status> statuses = search.statuses();
        if (statuses == null || statuses.isEmpty()) {
            statuses = List.of(RoomListing.Status.AVAILABLE, RoomListing.Status.IN_TALKS);
        }
        List<RoomListing.Status> finalStatuses = statuses;
        return (root, query, cb) -> {
            List<RoomListing.Status> filtered = finalStatuses;
            if (!search.includeDeleted()) {
                filtered = filtered.stream()
                        .filter(status -> status != RoomListing.Status.DELETED)
                        .collect(Collectors.toList());
            }
            return root.get("status").in(filtered);
        };
    }

    private Specification<RoomListing> priceFilter(RoomListingSearch search) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (search.minRent() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rentMonthly"), search.minRent()));
            }
            if (search.maxRent() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("rentMonthly"), search.maxRent()));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private Specification<RoomListing> roomTypeFilter(RoomListingSearch search) {
        return (root, query, cb) -> {
            if (search.roomType() == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("roomType"), search.roomType());
        };
    }

    private Specification<RoomListing> listingForFilter(RoomListingSearch search) {
        return (root, query, cb) -> {
            if (search.listingFor() == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("listingFor"), search.listingFor());
        };
    }

    private Specification<RoomListing> amenitiesFilter(RoomListingSearch search) {
        return (root, query, cb) -> {
            if (search.amenities() == null || search.amenities().isEmpty()) {
                return cb.conjunction();
            }
            query.distinct(true);
            return root.join("amenities").in(search.amenities());
        };
    }

    private Specification<RoomListing> availabilityFilter(RoomListingSearch search) {
        LocalDate availableBy = search.availableBy();
        if (availableBy == null) {
            return (root, query, cb) -> cb.conjunction();
        }
        return (root, query, cb) -> cb.or(
                cb.isNull(root.get("leaseStartDate")),
                cb.lessThanOrEqualTo(root.get("leaseStartDate"), availableBy)
        );
    }

    private Specification<RoomListing> boundingBoxFilter(RoomListingSearch search) {
        BigDecimal minLat = search.minLat();
        BigDecimal maxLat = search.maxLat();
        BigDecimal minLng = search.minLng();
        BigDecimal maxLng = search.maxLng();
        if (minLat == null || maxLat == null || minLng == null || maxLng == null) {
            return (root, query, cb) -> cb.conjunction();
        }
        return (root, query, cb) -> cb.and(
                cb.between(root.get("latApprox"), minLat, maxLat),
                cb.between(root.get("lngApprox"), minLng, maxLng)
        );
    }

    public record RoomListingSearch(
            BigDecimal minRent,
            BigDecimal maxRent,
            RoomListing.RoomType roomType,
            RoomListing.ListingFor listingFor,
            List<String> amenities,
            LocalDate availableBy,
            BigDecimal minLat,
            BigDecimal maxLat,
            BigDecimal minLng,
            BigDecimal maxLng,
            List<RoomListing.Status> statuses,
            boolean includeDeleted
    ) {}
}
