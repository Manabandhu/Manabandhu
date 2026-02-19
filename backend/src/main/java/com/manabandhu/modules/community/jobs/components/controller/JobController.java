package com.manabandhu.modules.community.jobs.components.controller;

import com.manabandhu.dto.JobDTO;
import com.manabandhu.modules.community.jobs.components.model.Job;
import com.manabandhu.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    @Autowired
    private JobService jobService;

    @GetMapping
    public ResponseEntity<Page<JobDTO>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<JobDTO> jobs = jobService.getAllJobs(page, size);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<JobDTO>> searchJobs(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<JobDTO> jobs = jobService.searchJobs(keyword, page, size);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<Page<JobDTO>> getJobsByType(
            @PathVariable Job.JobType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<JobDTO> jobs = jobService.getJobsByType(type, page, size);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<JobDTO>> getUserJobs(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<JobDTO> jobs = jobService.getUserJobs(userId, page, size);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDTO> getJobById(@PathVariable Long id) {
        JobDTO job = jobService.getJobById(id);
        return ResponseEntity.ok(job);
    }

    @PostMapping
    public ResponseEntity<JobDTO> createJob(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        String postedBy = authentication.getName();
        String title = (String) request.get("title");
        String company = (String) request.get("company");
        String description = (String) request.get("description");
        String location = (String) request.get("location");
        Job.JobType type = Job.JobType.valueOf((String) request.get("type"));
        
        BigDecimal salaryMin = request.get("salaryMin") != null ? 
            new BigDecimal(request.get("salaryMin").toString()) : null;
        BigDecimal salaryMax = request.get("salaryMax") != null ? 
            new BigDecimal(request.get("salaryMax").toString()) : null;
        
        String contactEmail = (String) request.get("contactEmail");
        String requirements = (String) request.get("requirements");
        
        JobDTO job = jobService.createJob(postedBy, title, company, description, 
                                         location, type, salaryMin, salaryMax, 
                                         contactEmail, requirements);
        return ResponseEntity.ok(job);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable Long id,
            Authentication authentication) {
        String userId = authentication.getName();
        jobService.deleteJob(id, userId);
        return ResponseEntity.ok().build();
    }
}