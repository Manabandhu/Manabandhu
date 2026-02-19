package com.manabandhu.shared.utils;

import com.manabandhu.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByFirebaseUid(String firebaseUid);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    List<User> findByIsActiveTrue();
    boolean existsByProxyName(String proxyName);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
}
