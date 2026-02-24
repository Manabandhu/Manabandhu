package com.manabandhu.shared.utils;

import com.manabandhu.dto.JobDTO;
import com.manabandhu.modules.community.jobs.components.model.Job;
import com.manabandhu.repository.JobRepository;
import com.manabandhu.shared.constants.JobMessages;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Transactional
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    public Page<JobDTO> getAllJobs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobs = jobRepository.findAllByOrderByCreatedAtDesc(pageable);
        return jobs.map(JobDTO::new);
    }

    public Page<JobDTO> searchJobs(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobs = jobRepository.searchJobs(keyword, pageable);
        return jobs.map(JobDTO::new);
    }

    public Page<JobDTO> getJobsByType(Job.JobType type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobs = jobRepository.findByTypeOrderByCreatedAtDesc(type, pageable);
        return jobs.map(JobDTO::new);
    }

    public Page<JobDTO> getUserJobs(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobs = jobRepository.findByPostedByOrderByCreatedAtDesc(userId, pageable);
        return jobs.map(JobDTO::new);
    }

    public JobDTO getJobById(Long id) {
        Job job = jobRepository.findById(id)
            .orElseThrow(() -> new RuntimeException(JobMessages.JOB_NOT_FOUND));
        return new JobDTO(job);
    }

    public JobDTO createJob(String postedBy, String title, String company, String description, 
                           String location, Job.JobType type, BigDecimal salaryMin, 
                           BigDecimal salaryMax, String contactEmail, String requirements) {
        Job job = new Job(title, company, description, location, type, postedBy);
        job.setSalaryMin(salaryMin);
        job.setSalaryMax(salaryMax);
        job.setContactEmail(contactEmail);
        job.setRequirements(requirements);
        
        job = jobRepository.save(job);
        return new JobDTO(job);
    }

    public void deleteJob(Long id, String userId) {
        Job job = jobRepository.findById(id)
            .orElseThrow(() -> new RuntimeException(JobMessages.JOB_NOT_FOUND));
        
        if (!job.getPostedBy().equals(userId)) {
            throw new RuntimeException(JobMessages.JOB_DELETE_NOT_AUTHORIZED);
        }
        
        jobRepository.delete(job);
    }
}
