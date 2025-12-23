package com.manabandhu.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import com.manabandhu.dto.*;
import com.manabandhu.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
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
