package com.manabandhu.modules.user.components.controller;

import com.manabandhu.core.security.JwtTokenService;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "APIs for user authentication")
public class AuthController {

    private final UserService userService;
    private final JwtTokenService jwtTokenService;

    public AuthController(UserService userService, JwtTokenService jwtTokenService) {
        this.userService = userService;
        this.jwtTokenService = jwtTokenService;
    }

    @PostMapping("/signup")
    @Operation(summary = "User signup", description = "Create a new user account")
    @ApiResponse(responseCode = "201", description = "User created successfully")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        CreateUserRequest userRequest = new CreateUserRequest();
        String authUserId = UUID.randomUUID().toString();
        userRequest.setAuthUserId(authUserId);
        userRequest.setName(request.getName());
        userRequest.setEmail(request.getEmail());

        UserDTO user = userService.createUser(userRequest);
        String accessToken = jwtTokenService.issueAccessToken(authUserId);
        String refreshToken = jwtTokenService.issueRefreshToken(authUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("user", user);
        response.put("message", "User created successfully");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        UserDTO user = userService.getUserByEmail(request.getEmail());
        String accessToken = jwtTokenService.issueAccessToken(user.getAuthUserId());
        String refreshToken = jwtTokenService.issueRefreshToken(user.getAuthUserId());
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("user", user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> payload) {
        String refreshToken = payload.get("refreshToken");
        if (refreshToken == null || !jwtTokenService.isRefreshToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid refresh token"));
        }
        String subject = jwtTokenService.subject(refreshToken);
        return ResponseEntity.ok(Map.of(
                "accessToken", jwtTokenService.issueAccessToken(subject),
                "refreshToken", jwtTokenService.issueRefreshToken(subject)
        ));
    }

    @PostMapping("/verify-token")
    public ResponseEntity<?> verifyToken(@RequestBody Map<String, String> payload) {
        try {
            String idToken = payload.get("idToken");
            String uid = jwtTokenService.subject(idToken);
            UserDTO user = userService.getUserByAuthUserId(uid);
            return ResponseEntity.ok(Map.of("valid", true, "user", user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valid", false, "error", e.getMessage()));
        }
    }
}
