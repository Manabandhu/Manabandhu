package com.manabandhu.repository;

import com.manabandhu.modules.community.discussions.components.model.CommunityPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    Page<CommunityPost> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<CommunityPost> findByAuthorIdOrderByCreatedAtDesc(String authorId, Pageable pageable);
}