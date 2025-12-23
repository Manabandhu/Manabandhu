package com.manabandhu.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import com.manabandhu.dto.*;
import com.manabandhu.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "APIs for user authentication")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    @Operation(summary = "User signup", description = "Create a new user account with Firebase authentication")
    @ApiResponse(responseCode = "201", description = "User created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid signup data or user already exists")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        try {
            UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                .setEmail(request.getEmail())
                .setPassword(request.getPassword())
                .setDisplayName(request.getName())
                .setEmailVerified(false);

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(createRequest);
            
            CreateUserRequest userRequest = new CreateUserRequest();
            userRequest.setFirebaseUid(userRecord.getUid());
            userRequest.setName(request.getName());
            userRequest.setEmail(request.getEmail());
            
            UserDTO user = userService.createUser(userRequest);
            
            String customToken = FirebaseAuth.getInstance().createCustomToken(userRecord.getUid());
            
            AuthResponse response = new AuthResponse(customToken, user);
            response.setMessage("User created successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (FirebaseAuthException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/verify-token")
    @Operation(summary = "Verify Firebase token", description = "Verify Firebase ID token and return user information")
    @ApiResponse(responseCode = "200", description = "Token verified successfully")
    @ApiResponse(responseCode = "401", description = "Invalid or expired token")
    public ResponseEntity<?> verifyToken(@RequestBody Map<String, String> payload) {
        try {
            String idToken = payload.get("idToken");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();
            
            UserDTO user = userService.getUserByFirebaseUid(uid);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("user", user);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("valid", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
}
