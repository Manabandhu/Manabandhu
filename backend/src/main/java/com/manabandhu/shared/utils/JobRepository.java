package com.manabandhu.shared.utils;

import com.manabandhu.modules.community.jobs.components.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    Page<Job> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    Page<Job> findByPostedByOrderByCreatedAtDesc(String postedBy, Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE " +
           "LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.company) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Job> searchJobs(@Param("keyword") String keyword, Pageable pageable);
    
    Page<Job> findByTypeOrderByCreatedAtDesc(Job.JobType type, Pageable pageable);
}