package com.manabandhu.service;

import com.manabandhu.dto.CreateUserRequest;
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

    @Cacheable(value = "users", key = "#firebaseUid")
    public UserDTO getUserByFirebaseUid(String firebaseUid) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToDTO(user);
    }

    @Transactional
    @CacheEvict(value = "users", key = "#request.firebaseUid")
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
    @CacheEvict(value = "users", key = "#firebaseUid")
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

    private UserDTO mapToDTO(User user) {
        return new UserDTO(
            user.getId(),
            user.getFirebaseUid(),
            user.getName(),
            user.getEmail(),
            user.getPhoneNumber(),
            user.getCountry(),
            user.getCity(),
            user.getRole(),
            user.getPhotoUrl(),
            user.getIsActive()
        );
    }
}
