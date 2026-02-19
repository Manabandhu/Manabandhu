package com.manabandhu.modules.community.qa.components.repository;

import com.manabandhu.modules.community.qa.components.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoteRepository extends JpaRepository<Vote, UUID> {

    Optional<Vote> findByTargetTypeAndTargetIdAndUserId(
        Vote.TargetType targetType, 
        UUID targetId, 
        String userId
    );

    void deleteByTargetTypeAndTargetIdAndUserId(
        Vote.TargetType targetType, 
        UUID targetId, 
        String userId
    );
}