package com.manabandhu.rooms;

import com.manabandhu.modules.messaging.chat.components.model.Chat;
import com.manabandhu.modules.messaging.chat.components.model.Message;
import com.manabandhu.modules.travel.rooms.components.dto.RoomListingRequest;
import com.manabandhu.modules.travel.rooms.components.model.ConversationLink;
import com.manabandhu.modules.travel.rooms.components.model.RoomListing;
import com.manabandhu.repository.ChatRepository;
import com.manabandhu.repository.ConversationLinkRepository;
import com.manabandhu.repository.MessageRepository;
import com.manabandhu.shared.utils.RoomListingService;
import com.manabandhu.shared.utils.RoomReviewService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:roomreview;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false",
        "spring.flyway.enabled=false"
})
class RoomReviewEligibilityTest {

    @Autowired
    private RoomListingService roomListingService;

    @Autowired
    private RoomReviewService roomReviewService;

    @Autowired
    private ConversationLinkRepository conversationLinkRepository;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Test
    void eligibilityRequiresConversationAndMessages() {
        String ownerId = "owner-123";
        String reviewerId = "reviewer-456";
        RoomListing listing = roomListingService.createListing(ownerId, buildRequest());

        Assertions.assertFalse(roomReviewService.isEligible(listing.getId(), reviewerId));

        Chat chat = new Chat("Direct Chat", Chat.ChatType.DIRECT, List.of(ownerId, reviewerId));
        chat = chatRepository.save(chat);

        ConversationLink link = new ConversationLink();
        link.setListingId(listing.getId());
        link.setOwnerUserId(ownerId);
        link.setOtherUserId(reviewerId);
        link.setChatThreadId(chat.getId().toString());
        link.setStartedAt(LocalDateTime.now().minusDays(1));
        link.setLastMessageAt(LocalDateTime.now().minusHours(2));
        link.setStatus(ConversationLink.Status.ACTIVE);
        conversationLinkRepository.save(link);

        messageRepository.save(new Message(chat.getId(), ownerId, "Hello", Message.MessageType.TEXT));
        messageRepository.save(new Message(chat.getId(), reviewerId, "Hi", Message.MessageType.TEXT));

        Assertions.assertTrue(roomReviewService.isEligible(listing.getId(), reviewerId));
    }

    private RoomListingRequest buildRequest() {
        RoomListingRequest request = new RoomListingRequest();
        request.setTitle("Sunny room in downtown");
        request.setListingFor(RoomListing.ListingFor.PROFESSIONAL);
        request.setRoomType(RoomListing.RoomType.PRIVATE);
        request.setPeopleAllowed(1);
        request.setRentMonthly(BigDecimal.valueOf(1200));
        request.setDeposit(BigDecimal.valueOf(500));
        request.setUtilitiesIncluded(true);
        request.setUtilities(List.of("water", "wifi"));
        request.setAmenities(List.of("furnished"));
        request.setVisitType(RoomListing.VisitType.BOTH);
        request.setDescription("Bright room with balcony");
        request.setLocationExactEnabled(false);
        request.setLatApprox(BigDecimal.valueOf(37.7749));
        request.setLngApprox(BigDecimal.valueOf(-122.4194));
        request.setApproxAreaLabel("Downtown");
        request.setImageUrls(List.of("https://example.com/photo.jpg"));
        return request;
    }
}
