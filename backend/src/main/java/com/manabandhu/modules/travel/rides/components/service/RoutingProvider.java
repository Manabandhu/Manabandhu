package com.manabandhu.modules.travel.rides.components.service;

import java.math.BigDecimal;

public interface RoutingProvider {
    RouteResult calculateRoute(BigDecimal pickupLat, BigDecimal pickupLng, BigDecimal dropLat, BigDecimal dropLng);

    RouteResult calculateRoute(BigDecimal startLat, BigDecimal startLng, BigDecimal endLat, BigDecimal endLng, boolean includePolyline);

    record RouteResult(BigDecimal distanceMiles, String polyline) {}
}
