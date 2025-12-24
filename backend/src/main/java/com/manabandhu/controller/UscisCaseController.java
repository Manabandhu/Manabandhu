package com.manabandhu.controller;

import com.manabandhu.dto.uscis.AddCaseRequest;
import com.manabandhu.dto.uscis.CaseResponse;
import com.manabandhu.dto.uscis.TimelineResponse;
import com.manabandhu.service.uscis.UscisCaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/uscis")
@RequiredArgsConstructor
@Tag(name = "USCIS Case Tracker", description = "USCIS case tracking and management")
public class UscisCaseController {
    
    private final UscisCaseService uscisCaseService;
    
    @PostMapping("/cases")
    @Operation(summary = "Add a new USCIS case to track")
    public ResponseEntity<CaseResponse> addCase(
            @Valid @RequestBody AddCaseRequest request,
            Authentication authentication) {
        
        String userId = authentication.getName();
        CaseResponse response = uscisCaseService.addCase(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/cases")
    @Operation(summary = "Get all user's USCIS cases")
    public ResponseEntity<List<CaseResponse>> getUserCases(Authentication authentication) {
        String userId = authentication.getName();
        List<CaseResponse> cases = uscisCaseService.getUserCases(userId);
        return ResponseEntity.ok(cases);
    }
    
    @GetMapping("/cases/{id}")
    @Operation(summary = "Get USCIS case details")
    public ResponseEntity<CaseResponse> getCaseDetails(
            @PathVariable UUID id,
            Authentication authentication) {
        
        String userId = authentication.getName();
        CaseResponse response = uscisCaseService.getCaseDetails(userId, id);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/cases/{id}")
    @Operation(summary = "Remove USCIS case from tracking")
    public ResponseEntity<Void> removeCase(
            @PathVariable UUID id,
            Authentication authentication) {
        
        String userId = authentication.getName();
        uscisCaseService.removeCase(userId, id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/cases/{id}/refresh")
    @Operation(summary = "Manually refresh USCIS case status")
    public ResponseEntity<CaseResponse> refreshCase(
            @PathVariable UUID id,
            Authentication authentication) {
        
        String userId = authentication.getName();
        CaseResponse response = uscisCaseService.refreshCase(userId, id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/cases/{id}/timeline")
    @Operation(summary = "Get USCIS case status timeline")
    public ResponseEntity<List<TimelineResponse>> getCaseTimeline(
            @PathVariable UUID id,
            Authentication authentication) {
        
        String userId = authentication.getName();
        List<TimelineResponse> timeline = uscisCaseService.getCaseTimeline(userId, id);
        return ResponseEntity.ok(timeline);
    }
}