package com.manabandhu.controller;

import com.manabandhu.model.room.Room;
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
        try {
            Room room = new Room();
            
            // Validate required fields
            String title = (String) request.get("title");
            if (title == null || title.trim().isEmpty()) {
                throw new IllegalArgumentException("Title is required");
            }
            room.setTitle(title.trim());
            
            // Description can be empty
            String description = (String) request.get("description");
            room.setDescription(description != null ? description.trim() : "");
            
            // Location can be empty
            String location = (String) request.get("location");
            room.setLocation(location != null ? location.trim() : "");
            
            // Handle rent conversion safely
            Object rentObj = request.get("rent");
            if (rentObj != null) {
                room.setRent(new java.math.BigDecimal(rentObj.toString()));
            } else {
                room.setRent(java.math.BigDecimal.ZERO);
            }
            
            // Handle type conversion safely
            Object typeObj = request.get("type");
            if (typeObj != null) {
                try {
                    room.setType(Room.RoomType.valueOf(typeObj.toString()));
                } catch (IllegalArgumentException e) {
                    room.setType(Room.RoomType.PRIVATE_ROOM);
                }
            } else {
                room.setType(Room.RoomType.PRIVATE_ROOM);
            }
            
            room.setPostedBy(auth.getName());
            
            Object contactInfoObj = request.get("contactInfo");
            room.setContactInfo(contactInfoObj != null ? contactInfoObj.toString() : "");
            
            return ResponseEntity.ok(roomRepository.save(room));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}