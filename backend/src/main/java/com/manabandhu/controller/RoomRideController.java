package com.manabandhu.controller;

import com.manabandhu.model.room.Room;
import com.manabandhu.model.ride.Ride;
import com.manabandhu.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomController {
    @Autowired
    private RoomRepository roomRepository;

    @GetMapping
    public ResponseEntity<Page<Room>> getAllRooms(@RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(roomRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, 10)));
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody Map<String, Object> request, Authentication auth) {
        Room room = new Room();
        room.setTitle((String) request.get("title"));
        room.setDescription((String) request.get("description"));
        room.setLocation((String) request.get("location"));
        room.setRent(new java.math.BigDecimal(request.get("rent").toString()));
        room.setType(Room.RoomType.valueOf((String) request.get("type")));
        room.setPostedBy(auth.getName());
        room.setContactInfo((String) request.get("contactInfo"));
        return ResponseEntity.ok(roomRepository.save(room));
    }
}

@RestController
@RequestMapping("/api/rides")
@CrossOrigin(origins = "*")
class RideController {
    @Autowired
    private com.manabandhu.repository.RideRepository rideRepository;

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