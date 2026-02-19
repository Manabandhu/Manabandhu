package com.manabandhu.shared.utils;

import com.manabandhu.dto.CreateUserRequest;
import com.manabandhu.dto.OnboardingRequest;
import com.manabandhu.dto.UserDTO;
import com.manabandhu.core.exception.ResourceNotFoundException;
import com.manabandhu.core.exception.ValidationException;
import com.manabandhu.model.User;
import com.manabandhu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    public UserDTO getUserByFirebaseUid(String firebaseUid) {
        try {
            if (!StringUtils.hasText(firebaseUid)) {
                throw new ValidationException("Firebase UID is required");
            }
            
            User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseGet(() -> {
                    log.info("Creating new user for Firebase UID: {}", firebaseUid);
                    User newUser = new User();
                    newUser.setFirebaseUid(firebaseUid);
                    newUser.setName("User");
                    newUser.setProxyName(generateProxyName());
                    newUser.setOnboardingCompleted(false);
                    return userRepository.save(newUser);
                });
            return mapToDTO(user);
        } catch (Exception e) {
            log.error("Error fetching user by Firebase UID {}: {}", firebaseUid, e.getMessage(), e);
            throw e;
        }
    }

    public List<UserDTO> getAllActiveUsers() {
        try {
            List<User> users = userRepository.findByIsActiveTrue();
            return users.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching active users: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch active users", e);
        }
    }

    @Transactional
    public UserDTO createUser(CreateUserRequest request) {
        try {
            validateCreateUserRequest(request);
            
            if (userRepository.findByFirebaseUid(request.getFirebaseUid()).isPresent()) {
                throw new ValidationException("User already exists with this Firebase UID");
            }
            
            User user = new User();
            user.setFirebaseUid(request.getFirebaseUid());
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setCountry(request.getCountry());
            user.setCity(request.getCity());
            user.setRole(request.getRole());
            user.setPhotoUrl(request.getPhotoUrl());
            user.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
            user.setProxyName(generateProxyName());
            
            User savedUser = userRepository.save(user);
            log.info("User created successfully with ID: {}", savedUser.getId());
            return mapToDTO(savedUser);
        } catch (Exception e) {
            log.error("Error creating user: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public UserDTO updateUser(String firebaseUid, CreateUserRequest request) {
        try {
            if (!StringUtils.hasText(firebaseUid)) {
                throw new ValidationException("Firebase UID is required");
            }
            
            validateCreateUserRequest(request);
            
            User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with Firebase UID: " + firebaseUid));
            
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setCountry(request.getCountry());
            user.setCity(request.getCity());
            user.setRole(request.getRole());
            user.setPhotoUrl(request.getPhotoUrl());
            if (request.getCurrency() != null) {
                user.setCurrency(request.getCurrency());
            }
            
            User updatedUser = userRepository.save(user);
            log.info("User updated successfully: {}", firebaseUid);
            return mapToDTO(updatedUser);
        } catch (Exception e) {
            log.error("Error updating user {}: {}", firebaseUid, e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public UserDTO updateOnboarding(String firebaseUid, OnboardingRequest request) {
        try {
            if (!StringUtils.hasText(firebaseUid)) {
                throw new ValidationException("Firebase UID is required");
            }
            
            validateOnboardingRequest(request);
            
            User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseGet(() -> {
                    log.info("Creating new user during onboarding for Firebase UID: {}", firebaseUid);
                    User newUser = new User();
                    newUser.setFirebaseUid(firebaseUid);
                    newUser.setName(request.getDisplayName());
                    newUser.setCountry(request.getCountry());
                    newUser.setCity(request.getCity());
                    newUser.setRole(request.getRole());
                    newUser.setProxyName(generateProxyName());
                    return newUser;
                });
            
            if (StringUtils.hasText(request.getDisplayName())) user.setName(request.getDisplayName());
            if (StringUtils.hasText(request.getCountry())) user.setCountry(request.getCountry());
            if (StringUtils.hasText(request.getCity())) user.setCity(request.getCity());
            if (StringUtils.hasText(request.getRole())) user.setRole(request.getRole());
            if (request.getPurposes() != null) user.setPurposes(request.getPurposes());
            if (request.getInterests() != null) user.setInterests(request.getInterests());
            if (request.getHomepagePriorities() != null) user.setHomepagePriorities(request.getHomepagePriorities());
            if (request.getEnabledPriorities() != null) user.setEnabledPriorities(request.getEnabledPriorities());
            if (request.getOnboardingCompleted() != null) user.setOnboardingCompleted(request.getOnboardingCompleted());
            
            User updatedUser = userRepository.save(user);
            log.info("User onboarding updated successfully: {}", firebaseUid);
            return mapToDTO(updatedUser);
        } catch (Exception e) {
            log.error("Error updating onboarding for user {}: {}", firebaseUid, e.getMessage(), e);
            throw e;
        }
    }

    private void validateCreateUserRequest(CreateUserRequest request) {
        if (request == null) {
            throw new ValidationException("User request is required");
        }
        if (!StringUtils.hasText(request.getFirebaseUid())) {
            throw new ValidationException("Firebase UID is required");
        }
        if (!StringUtils.hasText(request.getName()) || request.getName().trim().length() < 2) {
            throw new ValidationException("Name must be at least 2 characters");
        }
        if (StringUtils.hasText(request.getEmail()) && !isValidEmail(request.getEmail())) {
            throw new ValidationException("Invalid email format");
        }
    }

    private void validateOnboardingRequest(OnboardingRequest request) {
        if (request == null) {
            throw new ValidationException("Onboarding request is required");
        }
        if (StringUtils.hasText(request.getDisplayName()) && request.getDisplayName().trim().length() < 2) {
            throw new ValidationException("Display name must be at least 2 characters");
        }
    }

    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirebaseUid(user.getFirebaseUid());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setCountry(user.getCountry());
        dto.setCity(user.getCity());
        dto.setRole(user.getRole());
        dto.setPhotoUrl(user.getPhotoUrl());
        dto.setCurrency(user.getCurrency());
        dto.setAuthProvider(user.getAuthProvider());
        dto.setProxyName(user.getProxyName());
        dto.setIsActive(user.getIsActive());
        dto.setPurposes(user.getPurposes());
        dto.setInterests(user.getInterests());
        dto.setHomepagePriorities(user.getHomepagePriorities());
        dto.setEnabledPriorities(user.getEnabledPriorities());
        dto.setOnboardingCompleted(user.getOnboardingCompleted());
        return dto;
    }

    private String generateProxyName() {
        String[] adjectives = {"Happy", "Clever", "Bright", "Swift", "Calm", "Bold", "Kind", "Wise", "Cool", "Smart"};
        String[] nouns = {"Panda", "Tiger", "Eagle", "Wolf", "Fox", "Bear", "Lion", "Hawk", "Owl", "Deer"};
        
        Random random = new Random();
        String adjective = adjectives[random.nextInt(adjectives.length)];
        String noun = nouns[random.nextInt(nouns.length)];
        int number = random.nextInt(9999) + 1;
        
        String proxyName = adjective + noun + number;
        
        int attempts = 0;
        while (userRepository.existsByProxyName(proxyName) && attempts < 10) {
            number = random.nextInt(9999) + 1;
            proxyName = adjective + noun + number;
            attempts++;
        }
        
        if (attempts >= 10) {
            proxyName = "User" + System.currentTimeMillis();
        }
        
        return proxyName;
    }
}
