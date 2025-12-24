package com.manabandhu.rooms;

import com.manabandhu.model.room.RoomListing;
import com.manabandhu.repository.RoomListingActivityRepository;
import com.manabandhu.repository.RoomListingRepository;
import com.manabandhu.service.RoomListingService;
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
        "spring.datasource.url=jdbc:h2:mem:roomautohide;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false"
})
class RoomListingAutoHideTest {

    @Autowired
    private RoomListingRepository roomListingRepository;

    @Autowired
    private RoomListingActivityRepository activityRepository;

    @Autowired
    private RoomListingService roomListingService;

    @Test
    void autoHideUpdatesStatusAndCreatesActivity() {
        RoomListing listing = new RoomListing();
        listing.setOwnerUserId("owner-789");
        listing.setTitle("Cozy studio");
        listing.setListingFor(RoomListing.ListingFor.STUDENT);
        listing.setRoomType(RoomListing.RoomType.ENTIRE_UNIT);
        listing.setPeopleAllowed(1);
        listing.setRentMonthly(BigDecimal.valueOf(900));
        listing.setUtilitiesIncluded(false);
        listing.setUtilities(List.of());
        listing.setAmenities(List.of());
        listing.setVisitType(RoomListing.VisitType.VIDEO_CALL);
        listing.setDescription("Quiet place");
        listing.setLocationExactEnabled(false);
        listing.setLatApprox(BigDecimal.valueOf(40.7128));
        listing.setLngApprox(BigDecimal.valueOf(-74.0060));
        listing.setApproxAreaLabel("Midtown");
        listing.setImageUrls(List.of());
        listing.setStatus(RoomListing.Status.AVAILABLE);
        listing.setCreatedAt(LocalDateTime.now().minusDays(40));
        listing.setUpdatedAt(LocalDateTime.now().minusDays(40));
        listing.setLastActivityAt(LocalDateTime.now().minusDays(31));
        roomListingRepository.save(listing);

        int hiddenCount = roomListingService.autoHideInactiveListings(LocalDateTime.now().minusDays(30));

        RoomListing updated = roomListingRepository.findById(listing.getId()).orElseThrow();
        Assertions.assertEquals(RoomListing.Status.HIDDEN, updated.getStatus());
        Assertions.assertNotNull(updated.getHiddenAt());
        Assertions.assertEquals(1, hiddenCount);
        Assertions.assertFalse(activityRepository.findAll().isEmpty());
    }
}
