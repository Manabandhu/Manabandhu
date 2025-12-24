package com.manabandhu.service;

import com.manabandhu.dto.rooms.RoomListingRequest;
import com.manabandhu.model.notification.NotificationEvent;
import com.manabandhu.model.room.ConversationLink;
import com.manabandhu.model.room.RoomListing;
import com.manabandhu.model.room.RoomListingActivity;
import com.manabandhu.repository.ConversationLinkRepository;
import com.manabandhu.repository.RoomListingActivityRepository;
import com.manabandhu.repository.RoomListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoomListingService {
    private final RoomListingRepository roomListingRepository;
    private final RoomListingActivityRepository activityRepository;
    private final ConversationLinkRepository conversationLinkRepository;
    private final ChatService chatService;
    private final NotificationEventService notificationEventService;

    @Autowired
    public RoomListingService(
            RoomListingRepository roomListingRepository,
            RoomListingActivityRepository activityRepository,
            ConversationLinkRepository conversationLinkRepository,
            ChatService chatService,
            NotificationEventService notificationEventService) {
        this.roomListingRepository = roomListingRepository;
        this.activityRepository = activityRepository;
        this.conversationLinkRepository = conversationLinkRepository;
        this.chatService = chatService;
        this.notificationEventService = notificationEventService;
    }

    public RoomListing createListing(String ownerUserId, RoomListingRequest request) {
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
        createActivity(listing, ownerUserId, RoomListingActivity.ActivityType.CREATED, Map.of("title", listing.getTitle()));
        return listing;
    }

    public RoomListing updateListing(String userId, UUID listingId, RoomListingRequest request) {
        RoomListing listing = getOwnedListing(userId, listingId);
        validateLocation(request);
        applyRequest(listing, request);
        listing.setLastActivityAt(LocalDateTime.now());
        listing = roomListingRepository.save(listing);
        createActivity(listing, userId, RoomListingActivity.ActivityType.UPDATED, Map.of("title", listing.getTitle()));
        return listing;
    }

    public RoomListing getListing(UUID listingId) {
        return roomListingRepository.findById(listingId)
                .orElseThrow(() -> new NoSuchElementException("Listing not found"));
    }

    public Page<RoomListing> getListings(RoomListingSearch search, Pageable pageable) {
        Specification<RoomListing> spec = Specification.where(statusFilter(search))
                .and(priceFilter(search))
                .and(roomTypeFilter(search))
                .and(listingForFilter(search))
                .and(amenitiesFilter(search))
                .and(availabilityFilter(search))
                .and(boundingBoxFilter(search));
        return roomListingRepository.findAll(spec, pageable);
    }

    public Page<RoomListing> getMyListings(String ownerUserId, Pageable pageable) {
        Page<RoomListing> page = roomListingRepository.findByOwnerUserIdOrderByCreatedAtDesc(ownerUserId, pageable);
        List<RoomListing> filtered = page.getContent().stream()
                .filter(listing -> listing.getStatus() != RoomListing.Status.DELETED)
                .collect(Collectors.toList());
        return new org.springframework.data.domain.PageImpl<>(filtered, pageable, page.getTotalElements());
    }

    public RoomListing updateStatus(String userId, UUID listingId, RoomListing.Status status) {
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
        createActivity(saved, userId, RoomListingActivity.ActivityType.STATUS_CHANGED,
                Map.of("from", previous.name(), "to", status.name()));
        return saved;
    }

    public RoomListing repostListing(String userId, UUID listingId) {
        RoomListing listing = getOwnedListing(userId, listingId);
        LocalDateTime now = LocalDateTime.now();
        listing.setStatus(RoomListing.Status.AVAILABLE);
        listing.setHiddenAt(null);
        listing.setCreatedAt(now);
        listing.setLastActivityAt(now);
        listing = roomListingRepository.save(listing);
        createActivity(listing, userId, RoomListingActivity.ActivityType.REPOSTED, Map.of("title", listing.getTitle()));
        return listing;
    }

    public void deleteListing(String userId, UUID listingId) {
        RoomListing listing = getOwnedListing(userId, listingId);
        listing.setStatus(RoomListing.Status.DELETED);
        listing.setLastActivityAt(LocalDateTime.now());
        roomListingRepository.save(listing);
        createActivity(listing, userId, RoomListingActivity.ActivityType.DELETED, Map.of("title", listing.getTitle()));
    }

    public String startChat(UUID listingId, String currentUserId) {
        RoomListing listing = getListing(listingId);
        if (listing.getStatus() == RoomListing.Status.DELETED) {
            throw new NoSuchElementException("Listing not found");
        }
        if (listing.getOwnerUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("Owner cannot start chat with themselves");
        }
        String chatThreadId = chatService.getOrCreateDirectChat(listing.getOwnerUserId(), currentUserId).getId().toString();
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
        createActivity(listing, currentUserId, RoomListingActivity.ActivityType.CHAT_STARTED, Map.of("chatThreadId", chatThreadId));
        return chatThreadId;
    }

    public void heartbeat(String chatThreadId) {
        ConversationLink link = conversationLinkRepository.findByChatThreadId(chatThreadId)
                .orElseThrow(() -> new NoSuchElementException("Conversation link not found"));
        LocalDateTime now = LocalDateTime.now();
        link.setLastMessageAt(now);
        conversationLinkRepository.save(link);
        RoomListing listing = getListing(link.getListingId());
        listing.setLastActivityAt(now);
        roomListingRepository.save(listing);
    }

    public int autoHideInactiveListings(LocalDateTime cutoff) {
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
            notificationEventService.createEvent(
                    listing.getOwnerUserId(),
                    NotificationEvent.NotificationType.LISTING_HIDDEN_DUE_TO_INACTIVITY,
                    Map.of("listingId", listing.getId().toString(), "title", listing.getTitle())
            );
        }
        return inactive.size();
    }

    public List<UUID> getListingIdsForOwner(String ownerUserId) {
        return roomListingRepository.findByOwnerUserIdOrderByCreatedAtDesc(ownerUserId, Pageable.unpaged())
                .stream()
                .map(RoomListing::getId)
                .collect(Collectors.toList());
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
                throw new IllegalArgumentException("Exact coordinates are required when exact location is enabled");
            }
        }
    }

    private RoomListing getOwnedListing(String userId, UUID listingId) {
        RoomListing listing = getListing(listingId);
        if (!listing.getOwnerUserId().equals(userId)) {
            throw new SecurityException("Not authorized to modify this listing");
        }
        return listing;
    }

    private void createActivity(RoomListing listing, String actorUserId, RoomListingActivity.ActivityType type, Map<String, Object> metadata) {
        RoomListingActivity activity = new RoomListingActivity();
        activity.setListingId(listing.getId());
        activity.setActorUserId(actorUserId);
        activity.setType(type);
        activity.setMetadata(metadata);
        activityRepository.save(activity);
    }

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
            List<javax.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (search.minRent() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rentMonthly"), search.minRent()));
            }
            if (search.maxRent() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("rentMonthly"), search.maxRent()));
            }
            return cb.and(predicates.toArray(new javax.persistence.criteria.Predicate[0]));
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
