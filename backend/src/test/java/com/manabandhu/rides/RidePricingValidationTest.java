package com.manabandhu.rides;

import com.manabandhu.modules.travel.rides.components.dto.RidePostRequest;
import com.manabandhu.modules.travel.rides.components.model.RidePost;
import com.manabandhu.modules.travel.rides.components.service.RidePricingService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

class RidePricingValidationTest {

    @Test
    void rejectsPerMileOutsideRange() {
        RidePricingService pricingService = new RidePricingService();
        RidePostRequest request = new RidePostRequest();
        request.setPricingMode(RidePost.PricingMode.PER_MILE);
        request.setPricePerMile(new BigDecimal("5.00"));

        IllegalArgumentException exception = Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> pricingService.computePricing(request, new BigDecimal("10.0"))
        );

        Assertions.assertTrue(exception.getMessage().contains("between 0.10 and 4.00"));
    }
}
