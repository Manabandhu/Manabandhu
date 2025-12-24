package com.manabandhu.service.uscis;

import com.manabandhu.dto.uscis.AddCaseRequest;
import com.manabandhu.dto.uscis.CaseResponse;
import com.manabandhu.dto.uscis.TimelineResponse;
import com.manabandhu.model.uscis.UscisCase;
import com.manabandhu.model.uscis.UscisCaseActivity;
import com.manabandhu.model.uscis.UscisCaseHistory;
import com.manabandhu.repository.UscisCaseActivityRepository;
import com.manabandhu.repository.UscisCaseHistoryRepository;
import com.manabandhu.repository.UscisCaseRepository;
import com.manabandhu.service.NotificationEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class UscisCaseService {
    
    private final UscisCaseRepository caseRepository;
    private final UscisCaseHistoryRepository historyRepository;
    private final UscisCaseActivityRepository activityRepository;
    private final UscisStatusProvider statusProvider;
    private final NotificationEventService notificationService;
    
    private static final Pattern RECEIPT_PATTERN = Pattern.compile("^[A-Z]{3}\\d{10}$");
    
    @Transactional
    public CaseResponse addCase(String userId, AddCaseRequest request) {
        validateReceiptNumber(request.getReceiptNumber());
        
        if (caseRepository.existsByUserIdAndReceiptNumber(userId, request.getReceiptNumber())) {
            throw new IllegalArgumentException("Case already exists");
        }
        
        UscisStatusProvider.UscisStatusResult result = statusProvider.fetchCaseStatus(request.getReceiptNumber());
        
        UscisCase uscisCase = new UscisCase();
        uscisCase.setUserId(userId);
        uscisCase.setReceiptNumber(request.getReceiptNumber());
        uscisCase.setFormType(UscisCase.FormType.valueOf(result.formType()));
        uscisCase.setServiceCenter(UscisCase.ServiceCenter.valueOf(result.serviceCenter()));
        uscisCase.setCaseStatus(result.status());
        uscisCase.setCaseStatusCode(result.statusCode());
        uscisCase.setStatusDescription(result.description());
        uscisCase.setLastStatusDate(result.statusDate());
        uscisCase.setReceivedDate(result.receivedDate());
        uscisCase.setLastCheckedAt(LocalDateTime.now());
        
        uscisCase = caseRepository.save(uscisCase);
        
        // Create initial history entry
        createHistoryEntry(uscisCase, result);
        
        // Create activity
        createActivity(uscisCase.getId(), userId, UscisCaseActivity.ActivityType.CASE_ADDED, 
                      "Added case " + request.getReceiptNumber());
        
        return CaseResponse.from(uscisCase);
    }
    
    @Cacheable(value = "userCases", key = "#userId")
    public List<CaseResponse> getUserCases(String userId) {
        return caseRepository.findByUserIdAndIsActiveTrue(userId)
                .stream()
                .map(CaseResponse::from)
                .toList();
    }
    
    public CaseResponse getCaseDetails(String userId, UUID caseId) {
        UscisCase uscisCase = caseRepository.findByIdAndUserId(caseId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));
        return CaseResponse.from(uscisCase);
    }
    
    @Transactional
    @CacheEvict(value = "userCases", key = "#userId")
    public void removeCase(String userId, UUID caseId) {
        UscisCase uscisCase = caseRepository.findByIdAndUserId(caseId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));
        
        uscisCase.setIsActive(false);
        caseRepository.save(uscisCase);
        
        createActivity(caseId, userId, UscisCaseActivity.ActivityType.CASE_REMOVED, 
                      "Removed case " + uscisCase.getReceiptNumber());
    }
    
    @Transactional
    @CacheEvict(value = "userCases", key = "#userId")
    public CaseResponse refreshCase(String userId, UUID caseId) {
        UscisCase uscisCase = caseRepository.findByIdAndUserId(caseId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));
        
        UscisStatusProvider.UscisStatusResult result = statusProvider.fetchCaseStatus(uscisCase.getReceiptNumber());
        
        boolean statusChanged = !result.status().equals(uscisCase.getCaseStatus());
        
        if (statusChanged) {
            // Save current status to history before updating
            createHistoryEntry(uscisCase, new UscisStatusProvider.UscisStatusResult(
                uscisCase.getCaseStatus(),
                uscisCase.getStatusDescription(),
                uscisCase.getFormType().name(),
                uscisCase.getServiceCenter().name(),
                uscisCase.getLastStatusDate(),
                uscisCase.getReceivedDate(),
                uscisCase.getCaseStatusCode(),
                ""
            ));
            
            // Update with new status
            uscisCase.setCaseStatus(result.status());
            uscisCase.setCaseStatusCode(result.statusCode());
            uscisCase.setStatusDescription(result.description());
            uscisCase.setLastStatusDate(result.statusDate());
            
            // Send notification
            sendStatusChangeNotification(userId, uscisCase, result.status());
            
            createActivity(caseId, userId, UscisCaseActivity.ActivityType.STATUS_CHANGED, 
                          "Status changed to: " + result.status());
        } else {
            createActivity(caseId, userId, UscisCaseActivity.ActivityType.MANUAL_REFRESH, 
                          "Manual refresh - no change");
        }
        
        uscisCase.setLastCheckedAt(LocalDateTime.now());
        uscisCase = caseRepository.save(uscisCase);
        
        return CaseResponse.from(uscisCase);
    }
    
    public List<TimelineResponse> getCaseTimeline(String userId, UUID caseId) {
        UscisCase uscisCase = caseRepository.findByIdAndUserId(caseId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));
        
        return historyRepository.findByUscisCaseIdOrderByStatusDateDesc(caseId)
                .stream()
                .map(TimelineResponse::from)
                .toList();
    }
    
    @Transactional
    public void refreshAllActiveCases() {
        List<UscisCase> activeCases = caseRepository.findAllActiveCases();
        
        for (UscisCase uscisCase : activeCases) {
            try {
                UscisStatusProvider.UscisStatusResult result = statusProvider.fetchCaseStatus(uscisCase.getReceiptNumber());
                
                boolean statusChanged = !result.status().equals(uscisCase.getCaseStatus());
                
                if (statusChanged) {
                    createHistoryEntry(uscisCase, new UscisStatusProvider.UscisStatusResult(
                        uscisCase.getCaseStatus(),
                        uscisCase.getStatusDescription(),
                        uscisCase.getFormType().name(),
                        uscisCase.getServiceCenter().name(),
                        uscisCase.getLastStatusDate(),
                        uscisCase.getReceivedDate(),
                        uscisCase.getCaseStatusCode(),
                        ""
                    ));
                    
                    uscisCase.setCaseStatus(result.status());
                    uscisCase.setCaseStatusCode(result.statusCode());
                    uscisCase.setStatusDescription(result.description());
                    uscisCase.setLastStatusDate(result.statusDate());
                    
                    sendStatusChangeNotification(uscisCase.getUserId(), uscisCase, result.status());
                    
                    createActivity(uscisCase.getId(), uscisCase.getUserId(), 
                                 UscisCaseActivity.ActivityType.AUTO_REFRESH, 
                                 "Auto refresh - status changed to: " + result.status());
                } else {
                    createActivity(uscisCase.getId(), uscisCase.getUserId(), 
                                 UscisCaseActivity.ActivityType.AUTO_REFRESH, 
                                 "Auto refresh - no change");
                }
                
                uscisCase.setLastCheckedAt(LocalDateTime.now());
                caseRepository.save(uscisCase);
                
            } catch (Exception e) {
                log.error("Failed to refresh case: {}", uscisCase.getReceiptNumber(), e);
            }
        }
    }
    
    private void validateReceiptNumber(String receiptNumber) {
        if (!RECEIPT_PATTERN.matcher(receiptNumber).matches()) {
            throw new IllegalArgumentException("Invalid receipt number format");
        }
    }
    
    private void createHistoryEntry(UscisCase uscisCase, UscisStatusProvider.UscisStatusResult result) {
        UscisCaseHistory history = new UscisCaseHistory();
        history.setUscisCaseId(uscisCase.getId());
        history.setStatusTitle(result.status());
        history.setStatusDescription(result.description());
        history.setStatusDate(result.statusDate());
        history.setRawResponseSnapshot(result.rawResponse());
        historyRepository.save(history);
    }
    
    private void createActivity(UUID caseId, String userId, UscisCaseActivity.ActivityType type, String metadata) {
        UscisCaseActivity activity = new UscisCaseActivity();
        activity.setUscisCaseId(caseId);
        activity.setUserId(userId);
        activity.setType(type);
        activity.setMetadata(metadata);
        activityRepository.save(activity);
    }
    
    private void sendStatusChangeNotification(String userId, UscisCase uscisCase, String newStatus) {
        try {
            Map<String, Object> payload = Map.of(
                "title", "USCIS Case Update",
                "message", String.format("Your %s case status changed to '%s'%s", 
                    uscisCase.getFormType(), newStatus,
                    newStatus.toLowerCase().contains("approved") || 
                    (newStatus.toLowerCase().contains("card") && newStatus.toLowerCase().contains("produced")) 
                    ? " 🎉" : ""),
                "caseId", uscisCase.getId().toString(),
                "receiptNumber", uscisCase.getReceiptNumber()
            );
            
            notificationService.createEvent(userId, 
                com.manabandhu.model.notification.NotificationEvent.NotificationType.USCIS_STATUS_CHANGE, 
                payload);
        } catch (Exception e) {
            log.error("Failed to send notification for case: {}", uscisCase.getReceiptNumber(), e);
        }
    }
}