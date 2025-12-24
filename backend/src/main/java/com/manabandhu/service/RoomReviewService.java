package com.manabandhu.service;

import com.manabandhu.dto.rooms.RoomReviewRequest;
import com.manabandhu.dto.rooms.RoomReviewUpdateRequest;
import com.manabandhu.model.room.ConversationLink;
import com.manabandhu.model.room.RoomListing;
import com.manabandhu.model.room.RoomReview;
import com.manabandhu.repository.ConversationLinkRepository;
import com.manabandhu.repository.MessageRepository;
import com.manabandhu.repository.RoomReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class RoomReviewService {
    private final RoomReviewRepository roomReviewRepository;
    private final ConversationLinkRepository conversationLinkRepository;
    private final MessageRepository messageRepository;
    private final RoomListingService roomListingService;

    @Autowired
    public RoomReviewService(
            RoomReviewRepository roomReviewRepository,
            ConversationLinkRepository conversationLinkRepository,
            MessageRepository messageRepository,
            RoomListingService roomListingService) {
        this.roomReviewRepository = roomReviewRepository;
        this.conversationLinkRepository = conversationLinkRepository;
        this.messageRepository = messageRepository;
        this.roomListingService = roomListingService;
    }

    public boolean isEligible(UUID listingId, String reviewerUserId) {
        RoomListing listing = roomListingService.getListing(listingId);
        Optional<ConversationLink> linkOptional = conversationLinkRepository.findByListingIdAndOtherUserId(listingId, reviewerUserId);
        if (linkOptional.isEmpty()) {
            return false;
        }
        ConversationLink link = linkOptional.get();
        if (listing.getStatus() == RoomListing.Status.IN_TALKS || listing.getStatus() == RoomListing.Status.BOOKED) {
            return true;
        }
        if (link.getLastMessageAt() == null || link.getChatThreadId() == null) {
            return false;
        }
        Long chatId = parseChatId(link.getChatThreadId());
        if (chatId == null) {
            return false;
        }
        long totalMessages = messageRepository.countByChatId(chatId);
        long distinctSenders = messageRepository.countDistinctSenderIdByChatId(chatId);
        return totalMessages >= 2 || distinctSenders >= 2;
    }

    public RoomReview createReview(UUID listingId, String reviewerUserId, RoomReviewRequest request) {
        RoomListing listing = roomListingService.getListing(listingId);
        if (listing.getOwnerUserId().equals(reviewerUserId)) {
            throw new IllegalArgumentException("Owners cannot review their own listing");
        }
        if (!isEligible(listingId, reviewerUserId)) {
            throw new SecurityException("Not eligible to review this listing");
        }
        roomReviewRepository.findByListingIdAndReviewerUserIdAndType(listingId, reviewerUserId, request.getType())
                .ifPresent(existing -> {
                    throw new IllegalStateException("Review already exists for this listing and type");
                });
        RoomReview review = new RoomReview();
        review.setListingId(listingId);
        review.setReviewerUserId(reviewerUserId);
        review.setRevieweeUserId(listing.getOwnerUserId());
        review.setType(request.getType());
        review.setRating(request.getRating());
        review.setTags(request.getTags() == null ? List.of() : request.getTags());
        review.setComment(request.getComment());
        review.setEdited(false);
        review.setFlagged(false);
        return roomReviewRepository.save(review);
    }

    public List<RoomReview> getReviews(UUID listingId) {
        return roomReviewRepository.findByListingIdOrderByCreatedAtDesc(listingId);
    }

    public RoomReview updateReview(UUID reviewId, String reviewerUserId, RoomReviewUpdateRequest request) {
        RoomReview review = roomReviewRepository.findById(reviewId)
                .orElseThrow(() -> new NoSuchElementException("Review not found"));
        if (!review.getReviewerUserId().equals(reviewerUserId)) {
            throw new SecurityException("Not authorized to edit this review");
        }
        if (Duration.between(review.getCreatedAt(), LocalDateTime.now()).toHours() > 24) {
            throw new IllegalStateException("Reviews can only be edited within 24 hours");
        }
        review.setRating(request.getRating());
        review.setTags(request.getTags() == null ? List.of() : request.getTags());
        review.setComment(request.getComment());
        review.setEdited(true);
        return roomReviewRepository.save(review);
    }

    public RoomReview flagReview(UUID reviewId) {
        RoomReview review = roomReviewRepository.findById(reviewId)
                .orElseThrow(() -> new NoSuchElementException("Review not found"));
        review.setFlagged(true);
        return roomReviewRepository.save(review);
    }

    private Long parseChatId(String chatThreadId) {
        try {
            return Long.parseLong(chatThreadId);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
