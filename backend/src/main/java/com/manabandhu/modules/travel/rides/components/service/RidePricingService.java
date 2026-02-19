package com.manabandhu.modules.travel.rides.components.service;

import com.manabandhu.modules.travel.rides.components.dto.RidePostRequest;
import com.manabandhu.modules.travel.rides.components.model.RidePost;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class RidePricingService {
    public static final BigDecimal MIN_PER_MILE = new BigDecimal("0.10");
    public static final BigDecimal MAX_PER_MILE = new BigDecimal("4.00");

    public PricingResult computePricing(RidePostRequest request, BigDecimal distanceMiles) {
        if (request.getPricingMode() == RidePost.PricingMode.FIXED) {
            if (request.getPriceFixed() == null) {
                throw new IllegalArgumentException("Fixed price is required");
            }
            BigDecimal total = request.getPriceFixed().setScale(2, RoundingMode.HALF_UP);
            validateOverride(total, request.getPriceTotal());
            return new PricingResult(request.getPricingMode(), total, request.getPriceFixed(), null);
        }

        if (request.getPricePerMile() == null) {
            throw new IllegalArgumentException("Price per mile is required");
        }
        if (request.getPricePerMile().compareTo(MIN_PER_MILE) < 0 || request.getPricePerMile().compareTo(MAX_PER_MILE) > 0) {
            throw new IllegalArgumentException("Price per mile must be between 0.10 and 4.00");
        }
        BigDecimal total = distanceMiles.multiply(request.getPricePerMile()).setScale(2, RoundingMode.HALF_UP);
        validateOverride(total, request.getPriceTotal());
        return new PricingResult(request.getPricingMode(), total, null, request.getPricePerMile());
    }

    private void validateOverride(BigDecimal computed, BigDecimal provided) {
        if (provided != null && provided.setScale(2, RoundingMode.HALF_UP).compareTo(computed) != 0) {
            throw new IllegalArgumentException("Provided total does not match computed price");
        }
    }

    public record PricingResult(RidePost.PricingMode pricingMode,
                                BigDecimal priceTotal,
                                BigDecimal priceFixed,
                                BigDecimal pricePerMile) {
    }
}
