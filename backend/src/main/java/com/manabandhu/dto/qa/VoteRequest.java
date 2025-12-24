package com.manabandhu.dto.qa;

import com.manabandhu.model.qa.Vote;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class VoteRequest {
    
    @NotNull(message = "Target type is required")
    private Vote.TargetType targetType;
    
    @NotNull(message = "Target ID is required")
    private UUID targetId;
    
    @NotNull(message = "Vote type is required")
    private Vote.VoteType voteType;
}