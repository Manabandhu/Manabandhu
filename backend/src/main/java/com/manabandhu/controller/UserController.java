package com.manabandhu.controller;

import com.manabandhu.dto.CreateUserRequest;
import com.manabandhu.dto.UserDTO;
import com.manabandhu.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        String firebaseUid = (String) authentication.getPrincipal();
        UserDTO user = userService.getUserByFirebaseUid(firebaseUid);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDTO user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateCurrentUser(
            Authentication authentication,
            @Valid @RequestBody CreateUserRequest request) {
        String firebaseUid = (String) authentication.getPrincipal();
        UserDTO user = userService.updateUser(firebaseUid, request);
        return ResponseEntity.ok(user);
    }
}
