package com.manabandhu.repository;

import com.manabandhu.model.community.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByPostIdOrderByCreatedAtAsc(Long postId, Pageable pageable);
    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);
    long countByPostId(Long postId);
}

