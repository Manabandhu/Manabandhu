package com.manabandhu.repository.qa;

import com.manabandhu.model.qa.Vote;
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