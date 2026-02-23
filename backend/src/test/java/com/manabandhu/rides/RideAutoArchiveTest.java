package com.manabandhu.rides;

import com.manabandhu.modules.travel.rides.components.model.RidePost;
import com.manabandhu.repository.RidePostActivityRepository;
import com.manabandhu.repository.RidePostRepository;
import com.manabandhu.modules.travel.rides.components.service.RidePostService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:ridearchive;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false",
        "spring.flyway.enabled=false"
})
class RideAutoArchiveTest {

    @Autowired
    private RidePostRepository ridePostRepository;

    @Autowired
    private RidePostActivityRepository activityRepository;

    @Autowired
    private RidePostService ridePostService;

    @Test
    void autoArchiveMovesExpiredPosts() {
        RidePost post = new RidePost();
        post.setPostType(RidePost.PostType.OFFER);
        post.setOwnerUserId("owner-1");
        post.setTitle("Morning ride");
        post.setPickupLat(BigDecimal.valueOf(40.0));
        post.setPickupLng(BigDecimal.valueOf(-70.0));
        post.setPickupLabel("Pickup");
        post.setDropLat(BigDecimal.valueOf(41.0));
        post.setDropLng(BigDecimal.valueOf(-71.0));
        post.setDropLabel("Drop");
        post.setRouteDistanceMiles(BigDecimal.valueOf(12.5));
        post.setDepartAt(LocalDateTime.now().plusHours(2));
        post.setSeatsTotal(2);
        post.setPricingMode(RidePost.PricingMode.FIXED);
        post.setPriceFixed(BigDecimal.valueOf(15));
        post.setPriceTotal(BigDecimal.valueOf(15));
        post.setStatus(RidePost.Status.OPEN);
        post.setCreatedAt(LocalDateTime.now().minusHours(60));
        post.setUpdatedAt(LocalDateTime.now().minusHours(60));
        post.setLastActivityAt(LocalDateTime.now().minusHours(50));
        post.setExpiresAt(LocalDateTime.now().minusHours(1));
        ridePostRepository.save(post);

        int archived = ridePostService.autoArchiveExpiredPosts();

        RidePost updated = ridePostRepository.findById(post.getId()).orElseThrow();
        Assertions.assertEquals(RidePost.Status.ARCHIVED, updated.getStatus());
        Assertions.assertNotNull(updated.getArchivedAt());
        Assertions.assertEquals(1, archived);
        Assertions.assertFalse(activityRepository.findAll().isEmpty());
    }
}
