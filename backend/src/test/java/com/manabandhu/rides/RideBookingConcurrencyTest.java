package com.manabandhu.rides;

import com.manabandhu.modules.travel.rides.components.model.RidePost;
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
        "spring.datasource.url=jdbc:h2:mem:ridebooking;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false",
        "spring.flyway.enabled=false"
})
class RideBookingConcurrencyTest {

    @Autowired
    private RidePostRepository ridePostRepository;

    @Autowired
    private RidePostService ridePostService;

    @Test
    void preventsDoubleBooking() {
        RidePost post = new RidePost();
        post.setPostType(RidePost.PostType.OFFER);
        post.setOwnerUserId("driver-1");
        post.setTitle("Airport run");
        post.setPickupLat(BigDecimal.valueOf(40.0));
        post.setPickupLng(BigDecimal.valueOf(-70.0));
        post.setPickupLabel("Downtown");
        post.setDropLat(BigDecimal.valueOf(41.0));
        post.setDropLng(BigDecimal.valueOf(-71.0));
        post.setDropLabel("Airport");
        post.setRouteDistanceMiles(BigDecimal.valueOf(12.5));
        post.setDepartAt(LocalDateTime.now().plusHours(3));
        post.setSeatsTotal(2);
        post.setPricingMode(RidePost.PricingMode.FIXED);
        post.setPriceFixed(BigDecimal.valueOf(25));
        post.setPriceTotal(BigDecimal.valueOf(25));
        post.setStatus(RidePost.Status.OPEN);
        post.setCreatedAt(LocalDateTime.now().minusHours(2));
        post.setUpdatedAt(LocalDateTime.now().minusHours(2));
        post.setLastActivityAt(LocalDateTime.now().minusHours(1));
        post.setExpiresAt(LocalDateTime.now().plusHours(47));
        ridePostRepository.save(post);

        RidePost booked = ridePostService.book("rider-1", post.getId());
        Assertions.assertEquals(RidePost.Status.OPEN, booked.getStatus());

        Assertions.assertThrows(IllegalStateException.class,
                () -> ridePostService.book("rider-1", post.getId()));
    }
}
