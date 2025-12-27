package com.manabandhu.controller;

import com.manabandhu.model.ride.Ride;
import com.manabandhu.repository.RideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rides")
@CrossOrigin(origins = "*")
public class RideController {
    @Autowired
    private RideRepository rideRepository;

    @GetMapping
    public ResponseEntity<Page<Ride>> getAllRides(@RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(rideRepository.findAllByOrderByDepartureTimeAsc(PageRequest.of(page, 10)));
    }

    @PostMapping
    public ResponseEntity<Ride> createRide(@RequestBody Map<String, Object> request, Authentication auth) {
        Ride ride = new Ride();
        ride.setFromLocation((String) request.get("fromLocation"));
        ride.setToLocation((String) request.get("toLocation"));
        ride.setDepartureTime(java.time.LocalDateTime.parse((String) request.get("departureTime")));
        ride.setAvailableSeats((Integer) request.get("availableSeats"));
        ride.setPricePerSeat(new java.math.BigDecimal(request.get("pricePerSeat").toString()));
        ride.setDriverId(auth.getName());
        ride.setContactInfo((String) request.get("contactInfo"));
        return ResponseEntity.ok(rideRepository.save(ride));
    }
}