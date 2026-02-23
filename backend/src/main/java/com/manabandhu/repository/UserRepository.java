package com.manabandhu.repository;

import com.manabandhu.shared.utils.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByAuthUserId(String authUserId);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    List<User> findByIsActiveTrue();
    boolean existsByProxyName(String proxyName);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
}
