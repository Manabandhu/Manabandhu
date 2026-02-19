package com.manabandhu.shared.utils;

import com.manabandhu.modules.travel.rides.components.model.RidePostActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RidePostActivityRepository extends JpaRepository<RidePostActivity, UUID> {
    Page<RidePostActivity> findByActorUserIdOrderByCreatedAtDesc(String actorUserId, Pageable pageable);

    Page<RidePostActivity> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
