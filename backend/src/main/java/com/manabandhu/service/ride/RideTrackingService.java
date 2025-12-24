package com.manabandhu.service.ride;

import com.manabandhu.model.ride.RidePost;
import com.manabandhu.model.ride.RidePostActivity;
import com.manabandhu.model.ride.RideTrackingSession;
import com.manabandhu.repository.RidePostActivityRepository;
import com.manabandhu.repository.RidePostRepository;
import com.manabandhu.repository.RideTrackingSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@Transactional
public class RideTrackingService {
    private static final BigDecimal PICKUP_THRESHOLD_MILES = new BigDecimal("0.2");
    private static final BigDecimal DEFAULT_SPEED_MPH = new BigDecimal("30");

    private final RideTrackingSessionRepository trackingRepository;
    private final RidePostRepository ridePostRepository;
    private final RidePostActivityRepository activityRepository;
    private final RoutingProvider routingProvider;

    public RideTrackingService(RideTrackingSessionRepository trackingRepository,
                               RidePostRepository ridePostRepository,
                               RidePostActivityRepository activityRepository,
                               RoutingProvider routingProvider) {
        this.trackingRepository = trackingRepository;
        this.ridePostRepository = ridePostRepository;
        this.activityRepository = activityRepository;
        this.routingProvider = routingProvider;
    }

    public RideTrackingSession startTracking(UUID ridePostId, String userId) {
        RidePost post = ridePostRepository.findById(ridePostId)
                .orElseThrow(() -> new NoSuchElementException("Ride post not found"));
        if (post.getStatus() != RidePost.Status.BOOKED) {
            throw new IllegalStateException("Tracking is available only after booking");
        }
        RideTrackingSession session = trackingRepository
                .findByRidePostIdAndStatus(ridePostId, RideTrackingSession.Status.ACTIVE)
                .orElseGet(() -> {
                    RideTrackingSession created = new RideTrackingSession();
                    created.setRidePostId(ridePostId);
                    created.setDriverUserId(resolveDriverUserId(post));
                    created.setRiderUserId(resolveRiderUserId(post));
                    created.setStatus(RideTrackingSession.Status.ACTIVE);
                    created.setStartedAt(LocalDateTime.now());
                    return created;
                });
        if (!session.getDriverUserId().equals(userId) && !session.getRiderUserId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to start tracking");
        }
        if (session.getStatus() != RideTrackingSession.Status.ACTIVE) {
            session.setStatus(RideTrackingSession.Status.ACTIVE);
            session.setStartedAt(LocalDateTime.now());
        }
        RideTrackingSession saved = trackingRepository.save(session);
        post.setLastActivityAt(LocalDateTime.now());
        ridePostRepository.save(post);
        return saved;
    }

    public RideTrackingSession updateLocation(UUID ridePostId, String driverUserId, BigDecimal lat, BigDecimal lng) {
        RideTrackingSession session = trackingRepository
                .findByRidePostIdAndStatus(ridePostId, RideTrackingSession.Status.ACTIVE)
                .orElseThrow(() -> new NoSuchElementException("Tracking session not found"));
        if (!session.getDriverUserId().equals(driverUserId)) {
            throw new IllegalArgumentException("Only the driver can share location");
        }
        RidePost post = ridePostRepository.findById(ridePostId)
                .orElseThrow(() -> new NoSuchElementException("Ride post not found"));
        BigDecimal distanceToPickup = routingProvider.calculateRoute(lat, lng, post.getPickupLat(), post.getPickupLng()).distanceMiles();
        BigDecimal distanceToDrop = routingProvider.calculateRoute(lat, lng, post.getDropLat(), post.getDropLng()).distanceMiles();
        boolean headingToDrop = distanceToPickup.compareTo(PICKUP_THRESHOLD_MILES) <= 0;
        BigDecimal distanceRemaining = headingToDrop ? distanceToDrop : distanceToPickup;
        Integer etaMinutes = estimateEtaMinutes(distanceRemaining);

        LocalDateTime now = LocalDateTime.now();
        session.setLastLat(lat);
        session.setLastLng(lng);
        session.setLastLocationAt(now);
        session.setDistanceRemainingMiles(distanceRemaining);
        session.setEtaMinutes(etaMinutes);
        trackingRepository.save(session);

        post.setLastActivityAt(now);
        ridePostRepository.save(post);
        createActivity(post, driverUserId, RidePostActivity.ActivityType.LOCATION_SHARED,
                Map.of("etaMinutes", etaMinutes, "distanceRemaining", distanceRemaining));
        return session;
    }

    public RideTrackingSession getTracking(UUID ridePostId, String userId) {
        RideTrackingSession session = trackingRepository
                .findByRidePostIdAndStatus(ridePostId, RideTrackingSession.Status.ACTIVE)
                .orElseThrow(() -> new NoSuchElementException("Tracking session not found"));
        if (!session.getDriverUserId().equals(userId) && !session.getRiderUserId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to view tracking");
        }
        return session;
    }

    public RideTrackingSession endTracking(UUID ridePostId, String userId) {
        RideTrackingSession session = trackingRepository
                .findByRidePostIdAndStatus(ridePostId, RideTrackingSession.Status.ACTIVE)
                .orElseThrow(() -> new NoSuchElementException("Tracking session not found"));
        if (!session.getDriverUserId().equals(userId) && !session.getRiderUserId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to end tracking");
        }
        session.setStatus(RideTrackingSession.Status.ENDED);
        session.setEndedAt(LocalDateTime.now());
        RideTrackingSession saved = trackingRepository.save(session);
        ridePostRepository.findById(ridePostId).ifPresent(post -> {
            post.setLastActivityAt(LocalDateTime.now());
            ridePostRepository.save(post);
        });
        return saved;
    }

    public void cancelTracking(UUID ridePostId) {
        trackingRepository.findByRidePostIdAndStatus(ridePostId, RideTrackingSession.Status.ACTIVE)
                .ifPresent(session -> {
                    session.setStatus(RideTrackingSession.Status.CANCELLED);
                    session.setEndedAt(LocalDateTime.now());
                    trackingRepository.save(session);
                });
    }

    private String resolveDriverUserId(RidePost post) {
        return post.getPostType() == RidePost.PostType.OFFER ? post.getOwnerUserId() : post.getBookedByUserId();
    }

    private String resolveRiderUserId(RidePost post) {
        return post.getPostType() == RidePost.PostType.OFFER ? post.getBookedByUserId() : post.getOwnerUserId();
    }

    private Integer estimateEtaMinutes(BigDecimal distanceMiles) {
        if (distanceMiles == null) {
            return null;
        }
        BigDecimal hours = distanceMiles.divide(DEFAULT_SPEED_MPH, 4, RoundingMode.HALF_UP);
        return hours.multiply(BigDecimal.valueOf(60)).setScale(0, RoundingMode.HALF_UP).intValue();
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
}
