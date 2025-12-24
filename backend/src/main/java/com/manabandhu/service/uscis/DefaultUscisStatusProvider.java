package com.manabandhu.service.uscis;

import com.manabandhu.model.uscis.UscisCase;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class DefaultUscisStatusProvider implements UscisStatusProvider {
    
    private final RestTemplate restTemplate;
    private final String uscisBaseUrl;
    
    private static final Pattern STATUS_PATTERN = Pattern.compile("<h1[^>]*>([^<]+)</h1>");
    private static final Pattern DESCRIPTION_PATTERN = Pattern.compile("<p[^>]*class=\"[^\"]*text[^\"]*\"[^>]*>([^<]+)</p>");
    private static final Pattern DATE_PATTERN = Pattern.compile("(\\w+ \\d{1,2}, \\d{4})");
    
    public DefaultUscisStatusProvider(RestTemplate restTemplate, 
                                    @Value("${uscis.api.base-url:https://egov.uscis.gov}") String uscisBaseUrl) {
        this.restTemplate = restTemplate;
        this.uscisBaseUrl = uscisBaseUrl;
    }
    
    @Override
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 2000, multiplier = 2))
    public UscisStatusResult fetchCaseStatus(String receiptNumber) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("User-Agent", "Mozilla/5.0 (compatible; ManaBandhu/1.0)");
            
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("appReceiptNum", receiptNumber);
            formData.add("caseStatusSearchBtn", "CHECK STATUS");
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(formData, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(
                uscisBaseUrl + "/casestatus/mycasestatus.do", 
                request, 
                String.class
            );
            
            return parseResponse(response.getBody(), receiptNumber);
            
        } catch (Exception e) {
            log.error("Failed to fetch USCIS status for receipt: {}", receiptNumber, e);
            throw new RuntimeException("Failed to fetch case status", e);
        }
    }
    
    private UscisStatusResult parseResponse(String html, String receiptNumber) {
        if (html == null || html.isEmpty()) {
            throw new RuntimeException("Empty response from USCIS");
        }
        
        String status = extractStatus(html);
        String description = extractDescription(html);
        LocalDate statusDate = extractStatusDate(html);
        
        UscisCase.FormType formType = parseFormType(receiptNumber);
        UscisCase.ServiceCenter serviceCenter = parseServiceCenter(receiptNumber);
        UscisCase.CaseStatusCode statusCode = mapToStatusCode(status);
        
        return new UscisStatusResult(
            status,
            description,
            formType.name(),
            serviceCenter.name(),
            statusDate,
            null, // receivedDate not always available
            statusCode,
            html
        );
    }
    
    private String extractStatus(String html) {
        Matcher matcher = STATUS_PATTERN.matcher(html);
        return matcher.find() ? matcher.group(1).trim() : "Status not available";
    }
    
    private String extractDescription(String html) {
        Matcher matcher = DESCRIPTION_PATTERN.matcher(html);
        return matcher.find() ? matcher.group(1).trim() : "";
    }
    
    private LocalDate extractStatusDate(String html) {
        Matcher matcher = DATE_PATTERN.matcher(html);
        if (matcher.find()) {
            try {
                return LocalDate.parse(matcher.group(1), DateTimeFormatter.ofPattern("MMMM d, yyyy"));
            } catch (Exception e) {
                log.warn("Failed to parse date: {}", matcher.group(1));
            }
        }
        return LocalDate.now();
    }
    
    private UscisCase.FormType parseFormType(String receiptNumber) {
        // Extract form type from receipt number patterns
        if (receiptNumber.startsWith("IOE")) return UscisCase.FormType.I485;
        if (receiptNumber.startsWith("EAC")) return UscisCase.FormType.I140;
        if (receiptNumber.startsWith("WAC")) return UscisCase.FormType.I129;
        return UscisCase.FormType.OTHER;
    }
    
    private UscisCase.ServiceCenter parseServiceCenter(String receiptNumber) {
        String prefix = receiptNumber.substring(0, 3);
        return switch (prefix) {
            case "IOE" -> UscisCase.ServiceCenter.IOE;
            case "EAC" -> UscisCase.ServiceCenter.EAC;
            case "WAC" -> UscisCase.ServiceCenter.WAC;
            case "LIN" -> UscisCase.ServiceCenter.LIN;
            case "SRC" -> UscisCase.ServiceCenter.SRC;
            case "NBC" -> UscisCase.ServiceCenter.NBC;
            default -> UscisCase.ServiceCenter.OTHER;
        };
    }
    
    private UscisCase.CaseStatusCode mapToStatusCode(String status) {
        if (status == null) return UscisCase.CaseStatusCode.OTHER;
        
        String lowerStatus = status.toLowerCase();
        if (lowerStatus.contains("received")) return UscisCase.CaseStatusCode.RECEIVED;
        if (lowerStatus.contains("evidence") && lowerStatus.contains("sent")) return UscisCase.CaseStatusCode.RFE_SENT;
        if (lowerStatus.contains("evidence") && lowerStatus.contains("received")) return UscisCase.CaseStatusCode.RFE_RESPONSE_RECEIVED;
        if (lowerStatus.contains("interview") && lowerStatus.contains("scheduled")) return UscisCase.CaseStatusCode.INTERVIEW_SCHEDULED;
        if (lowerStatus.contains("interview") && lowerStatus.contains("completed")) return UscisCase.CaseStatusCode.INTERVIEW_COMPLETED;
        if (lowerStatus.contains("approved")) return UscisCase.CaseStatusCode.APPROVED;
        if (lowerStatus.contains("denied")) return UscisCase.CaseStatusCode.DENIED;
        if (lowerStatus.contains("card") && lowerStatus.contains("produced")) return UscisCase.CaseStatusCode.CARD_PRODUCED;
        if (lowerStatus.contains("card") && lowerStatus.contains("mailed")) return UscisCase.CaseStatusCode.CARD_MAILED;
        if (lowerStatus.contains("closed")) return UscisCase.CaseStatusCode.CASE_CLOSED;
        if (lowerStatus.contains("transferred")) return UscisCase.CaseStatusCode.TRANSFERRED;
        
        return UscisCase.CaseStatusCode.OTHER;
    }
}