package com.manabandhu.service;

import com.manabandhu.dto.rooms.PriceAlertRequest;
import com.manabandhu.exception.ResourceNotFoundException;
import com.manabandhu.exception.UnauthorizedException;
import com.manabandhu.exception.ValidationException;
import com.manabandhu.model.notification.NotificationEvent;
import com.manabandhu.model.room.PriceAlert;
import com.manabandhu.model.room.RoomListing;
import com.manabandhu.repository.PriceAlertRepository;
import com.manabandhu.repository.RoomListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PriceAlertService {
    private final PriceAlertRepository alertRepository;
    private final RoomListingRepository listingRepository;
    private final NotificationEventService notificationEventService;

    public PriceAlert createAlert(String userId, PriceAlertRequest request) {
        if (!StringUtils.hasText(userId)) {
            throw new UnauthorizedException("User authentication required");
        }
        if (request == null) {
            throw new ValidationException("Alert request is required");
        }

        PriceAlert alert = new PriceAlert();
        alert.setUserId(userId);
        alert.setMaxRent(request.getMaxRent());
        alert.setMinRent(request.getMinRent());
        alert.setRoomType(request.getRoomType());
        alert.setListingFor(request.getListingFor());
        alert.setAmenities(request.getAmenities() != null ? new ArrayList<>(request.getAmenities()) : new ArrayList<>());
        alert.setMinLat(request.getMinLat());
        alert.setMaxLat(request.getMaxLat());
        alert.setMinLng(request.getMinLng());
        alert.setMaxLng(request.getMaxLng());
        alert.setAreaLabel(request.getAreaLabel());
        alert.setAvailableBy(request.getAvailableBy());
        alert.setActive(true);

        alert = alertRepository.save(alert);
        log.info("Price alert created: {} by user {}", alert.getId(), userId);
        return alert;
    }

    public PriceAlert updateAlert(String userId, UUID alertId, PriceAlertRequest request) {
        if (!StringUtils.hasText(userId)) {
            throw new UnauthorizedException("User authentication required");
        }

        PriceAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
        
        if (!alert.getUserId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to update this alert");
        }

        if (request.getMaxRent() != null) alert.setMaxRent(request.getMaxRent());
        if (request.getMinRent() != null) alert.setMinRent(request.getMinRent());
        if (request.getRoomType() != null) alert.setRoomType(request.getRoomType());
        if (request.getListingFor() != null) alert.setListingFor(request.getListingFor());
        if (request.getAmenities() != null) alert.setAmenities(new ArrayList<>(request.getAmenities()));
        if (request.getMinLat() != null) alert.setMinLat(request.getMinLat());
        if (request.getMaxLat() != null) alert.setMaxLat(request.getMaxLat());
        if (request.getMinLng() != null) alert.setMinLng(request.getMinLng());
        if (request.getMaxLng() != null) alert.setMaxLng(request.getMaxLng());
        if (request.getAreaLabel() != null) alert.setAreaLabel(request.getAreaLabel());
        if (request.getAvailableBy() != null) alert.setAvailableBy(request.getAvailableBy());

        alert = alertRepository.save(alert);
        log.info("Price alert updated: {} by user {}", alertId, userId);
        return alert;
    }

    public void deleteAlert(String userId, UUID alertId) {
        if (!StringUtils.hasText(userId)) {
            throw new UnauthorizedException("User authentication required");
        }

        PriceAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
        
        if (!alert.getUserId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to delete this alert");
        }

        alertRepository.delete(alert);
        log.info("Price alert deleted: {} by user {}", alertId, userId);
    }

    public void deactivateAlert(String userId, UUID alertId) {
        if (!StringUtils.hasText(userId)) {
            throw new UnauthorizedException("User authentication required");
        }

        PriceAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
        
        if (!alert.getUserId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to deactivate this alert");
        }

        alert.setActive(false);
        alertRepository.save(alert);
        log.info("Price alert deactivated: {} by user {}", alertId, userId);
    }

    public Page<PriceAlert> getUserAlerts(String userId, Pageable pageable) {
        if (!StringUtils.hasText(userId)) {
            throw new UnauthorizedException("User authentication required");
        }
        return alertRepository.findByUserIdAndActiveTrueOrderByCreatedAtDesc(userId, pageable);
    }

    public void checkAlertsAndNotify() {
        List<PriceAlert> activeAlerts = alertRepository.findByActiveTrue();
        LocalDateTime now = LocalDateTime.now();
        
        for (PriceAlert alert : activeAlerts) {
            try {
                // Check if we should notify (not notified in last 24 hours)
                if (alert.getLastNotifiedAt() != null && 
                    alert.getLastNotifiedAt().isAfter(now.minusHours(24))) {
                    continue;
                }

                // Find matching listings
                Specification<RoomListing> spec = buildSpecification(alert);
                List<RoomListing> matchingListings = listingRepository.findAll(spec);

                if (!matchingListings.isEmpty()) {
                    // Send notification
                    notificationEventService.createEvent(
                            alert.getUserId(),
                            NotificationEvent.NotificationType.PRICE_ALERT_MATCHED,
                            java.util.Map.of(
                                    "alertId", alert.getId().toString(),
                                    "matchesCount", String.valueOf(matchingListings.size())
                            )
                    );

                    alert.setLastNotifiedAt(now);
                    alertRepository.save(alert);
                    log.info("Price alert notification sent: {} matches found for alert {}", 
                            matchingListings.size(), alert.getId());
                }
            } catch (Exception e) {
                log.error("Error checking alert {}: {}", alert.getId(), e.getMessage(), e);
            }
        }
    }

    private Specification<RoomListing> buildSpecification(PriceAlert alert) {
        return Specification.where(priceFilter(alert))
                .and(roomTypeFilter(alert))
                .and(listingForFilter(alert))
                .and(amenitiesFilter(alert))
                .and(locationFilter(alert))
                .and(availabilityFilter(alert))
                .and(statusFilter());
    }

    private Specification<RoomListing> priceFilter(PriceAlert alert) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (alert.getMinRent() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rentMonthly"), alert.getMinRent()));
            }
            if (alert.getMaxRent() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("rentMonthly"), alert.getMaxRent()));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private Specification<RoomListing> roomTypeFilter(PriceAlert alert) {
        return (root, query, cb) -> {
            if (alert.getRoomType() == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("roomType"), alert.getRoomType());
        };
    }

    private Specification<RoomListing> listingForFilter(PriceAlert alert) {
        return (root, query, cb) -> {
            if (alert.getListingFor() == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("listingFor"), alert.getListingFor());
        };
    }

    private Specification<RoomListing> amenitiesFilter(PriceAlert alert) {
        return (root, query, cb) -> {
            if (alert.getAmenities() == null || alert.getAmenities().isEmpty()) {
                return cb.conjunction();
            }
            query.distinct(true);
            return root.join("amenities").in(alert.getAmenities());
        };
    }

    private Specification<RoomListing> locationFilter(PriceAlert alert) {
        return (root, query, cb) -> {
            if (alert.getMinLat() == null || alert.getMaxLat() == null || 
                alert.getMinLng() == null || alert.getMaxLng() == null) {
                return cb.conjunction();
            }
            return cb.and(
                    cb.between(root.get("latApprox"), alert.getMinLat(), alert.getMaxLat()),
                    cb.between(root.get("lngApprox"), alert.getMinLng(), alert.getMaxLng())
            );
        };
    }

    private Specification<RoomListing> availabilityFilter(PriceAlert alert) {
        LocalDate availableBy = alert.getAvailableBy();
        if (availableBy == null) {
            return (root, query, cb) -> cb.conjunction();
        }
        return (root, query, cb) -> cb.or(
                cb.isNull(root.get("leaseStartDate")),
                cb.lessThanOrEqualTo(root.get("leaseStartDate"), availableBy)
        );
    }

    private Specification<RoomListing> statusFilter() {
        return (root, query, cb) -> root.get("status").in(
                RoomListing.Status.AVAILABLE, 
                RoomListing.Status.IN_TALKS
        );
    }
}

