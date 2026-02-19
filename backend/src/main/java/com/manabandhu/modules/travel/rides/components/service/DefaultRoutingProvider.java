package com.manabandhu.modules.travel.rides.components.service;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class DefaultRoutingProvider implements RoutingProvider {
    private static final double EARTH_RADIUS_MILES = 3958.8;

    @Override
    public RouteResult calculateRoute(BigDecimal pickupLat, BigDecimal pickupLng, BigDecimal dropLat, BigDecimal dropLng) {
        return calculateRoute(pickupLat, pickupLng, dropLat, dropLng, true);
    }

    @Override
    public RouteResult calculateRoute(BigDecimal startLat, BigDecimal startLng, BigDecimal endLat, BigDecimal endLng, boolean includePolyline) {
        double distance = haversineMiles(
                startLat.doubleValue(),
                startLng.doubleValue(),
                endLat.doubleValue(),
                endLng.doubleValue()
        );
        BigDecimal miles = BigDecimal.valueOf(distance).setScale(2, RoundingMode.HALF_UP);
        return new RouteResult(miles, null);
    }

    private double haversineMiles(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.pow(Math.sin(dLat / 2), 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.pow(Math.sin(dLon / 2), 2);
        double c = 2 * Math.asin(Math.sqrt(a));
        return EARTH_RADIUS_MILES * c;
    }
}
