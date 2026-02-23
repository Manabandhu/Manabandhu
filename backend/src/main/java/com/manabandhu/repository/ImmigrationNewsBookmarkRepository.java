package com.manabandhu.repository;

import com.manabandhu.modules.immigration.components.model.ImmigrationNewsBookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ImmigrationNewsBookmarkRepository extends JpaRepository<ImmigrationNewsBookmark, UUID> {
    
    Page<ImmigrationNewsBookmark> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    Optional<ImmigrationNewsBookmark> findByArticleIdAndUserId(UUID articleId, String userId);
    
    boolean existsByArticleIdAndUserId(UUID articleId, String userId);
    
    List<UUID> findArticleIdsByUserId(String userId);
    
    void deleteByArticleIdAndUserId(UUID articleId, String userId);
}