package com.manabandhu.service;

import com.manabandhu.dto.CreateUserRequest;
import com.manabandhu.dto.OnboardingRequest;
import com.manabandhu.dto.UserDTO;
import com.manabandhu.exception.ResourceNotFoundException;
import com.manabandhu.model.User;
import com.manabandhu.repository.UserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // @Cacheable(value = "users", key = "#firebaseUid")
    public UserDTO getUserByFirebaseUid(String firebaseUid) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
            .orElseGet(() -> {
                // Create a basic user record for Firebase authenticated users
                User newUser = new User();
                newUser.setFirebaseUid(firebaseUid);
                newUser.setOnboardingCompleted(false);
                return userRepository.save(newUser);
            });
        return mapToDTO(user);
    }

    @Transactional
    // @CacheEvict(value = "users", key = "#request.firebaseUid")
    public UserDTO createUser(CreateUserRequest request) {
        User user = new User();
        user.setFirebaseUid(request.getFirebaseUid());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setCountry(request.getCountry());
        user.setCity(request.getCity());
        user.setRole(request.getRole());
        user.setPhotoUrl(request.getPhotoUrl());
        
        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    @Transactional
    // @CacheEvict(value = "users", key = "#firebaseUid")
    public UserDTO updateUser(String firebaseUid, CreateUserRequest request) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setCountry(request.getCountry());
        user.setCity(request.getCity());
        user.setRole(request.getRole());
        user.setPhotoUrl(request.getPhotoUrl());
        
        User updatedUser = userRepository.save(user);
        return mapToDTO(updatedUser);
    }

    @Transactional
    // @CacheEvict(value = "users", key = "#firebaseUid")
    public UserDTO updateOnboarding(String firebaseUid, OnboardingRequest request) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
            .orElseGet(() -> {
                // Create user if doesn't exist (for Firebase authenticated users)
                User newUser = new User();
                newUser.setFirebaseUid(firebaseUid);
                newUser.setName(request.getDisplayName());
                newUser.setCountry(request.getCountry());
                newUser.setCity(request.getCity());
                newUser.setRole(request.getRole());
                return newUser;
            });
        
        if (request.getDisplayName() != null) user.setName(request.getDisplayName());
        if (request.getCountry() != null) user.setCountry(request.getCountry());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getPurposes() != null) user.setPurposes(request.getPurposes());
        if (request.getInterests() != null) user.setInterests(request.getInterests());
        if (request.getHomepagePriorities() != null) user.setHomepagePriorities(request.getHomepagePriorities());
        if (request.getEnabledPriorities() != null) user.setEnabledPriorities(request.getEnabledPriorities());
        if (request.getOnboardingCompleted() != null) user.setOnboardingCompleted(request.getOnboardingCompleted());
        
        User updatedUser = userRepository.save(user);
        return mapToDTO(updatedUser);
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
        dto.setIsActive(user.getIsActive());
        dto.setPurposes(user.getPurposes());
        dto.setInterests(user.getInterests());
        dto.setHomepagePriorities(user.getHomepagePriorities());
        dto.setEnabledPriorities(user.getEnabledPriorities());
        dto.setOnboardingCompleted(user.getOnboardingCompleted());
        return dto;
    }
}
