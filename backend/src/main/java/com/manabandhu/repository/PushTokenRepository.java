package com.manabandhu.repository;

import com.manabandhu.model.User;
import com.manabandhu.model.notification.PushToken;
import com.manabandhu.model.notification.PushToken.Platform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PushTokenRepository extends JpaRepository<PushToken, Long> {
    Optional<PushToken> findByTokenAndUser(String token, User user);
    List<PushToken> findByUserAndIsActiveTrue(User user);
    List<PushToken> findByUser(User user);
    void deleteByToken(String token);
    void deleteByUser(User user);
    List<PushToken> findByIsActiveTrue();
}

