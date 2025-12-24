package com.manabandhu.controller;

import com.manabandhu.dto.CreateUserRequest;
import com.manabandhu.dto.OnboardingRequest;
import com.manabandhu.dto.UserDTO;
import com.manabandhu.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "APIs for user operations")
@SecurityRequirement(name = "Firebase Auth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Retrieve the current authenticated user's information")
    @ApiResponse(responseCode = "200", description = "User information retrieved successfully")
    @ApiResponse(responseCode = "404", description = "User not found")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        String firebaseUid = (String) authentication.getPrincipal();
        UserDTO user = userService.getUserByFirebaseUid(firebaseUid);
        return ResponseEntity.ok(user);
    }

    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieve all active users for chat functionality")
    @ApiResponse(responseCode = "200", description = "Users retrieved successfully")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllActiveUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping
    @Operation(summary = "Create user", description = "Create a new user account")
    @ApiResponse(responseCode = "201", description = "User created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid user data")
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDTO user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user", description = "Update the current authenticated user's information")
    @ApiResponse(responseCode = "200", description = "User updated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid user data")
    @ApiResponse(responseCode = "404", description = "User not found")
    public ResponseEntity<UserDTO> updateCurrentUser(
            Authentication authentication,
            @Valid @RequestBody CreateUserRequest request) {
        String firebaseUid = (String) authentication.getPrincipal();
        UserDTO user = userService.updateUser(firebaseUid, request);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/me/onboarding")
    @Operation(summary = "Update onboarding status", description = "Update the user's onboarding completion status")
    @ApiResponse(responseCode = "200", description = "Onboarding status updated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid onboarding data")
    @ApiResponse(responseCode = "404", description = "User not found")
    public ResponseEntity<UserDTO> updateOnboarding(
            Authentication authentication,
            @Valid @RequestBody OnboardingRequest request) {
        String firebaseUid = (String) authentication.getPrincipal();
        UserDTO user = userService.updateOnboarding(firebaseUid, request);
        return ResponseEntity.ok(user);
    }
}
