package com.manabandhu.shared.utils;

import com.manabandhu.modules.immigration.components.model.ImmigrationNewsArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ImmigrationNewsArticleRepository extends JpaRepository<ImmigrationNewsArticle, UUID> {
    
    Page<ImmigrationNewsArticle> findByStatusOrderByPublishedAtDesc(
        ImmigrationNewsArticle.Status status, Pageable pageable);
    
    Page<ImmigrationNewsArticle> findByStatusAndIsBreakingOrderByPublishedAtDesc(
        ImmigrationNewsArticle.Status status, Boolean isBreaking, Pageable pageable);
    
    @Query("SELECT a FROM ImmigrationNewsArticle a WHERE a.status = :status " +
           "AND (:visaCategory IS NULL OR a.visaCategories LIKE %:visaCategory%) " +
           "AND (:country IS NULL OR a.countriesAffected LIKE %:country%) " +
           "AND (:impactLevel IS NULL OR a.impactLevel = :impactLevel) " +
           "AND (:sourceType IS NULL OR a.sourceType = :sourceType) " +
           "AND (:isBreaking IS NULL OR a.isBreaking = :isBreaking) " +
           "ORDER BY a.publishedAt DESC")
    Page<ImmigrationNewsArticle> findWithFilters(
        @Param("status") ImmigrationNewsArticle.Status status,
        @Param("visaCategory") String visaCategory,
        @Param("country") String country,
        @Param("impactLevel") ImmigrationNewsArticle.ImpactLevel impactLevel,
        @Param("sourceType") ImmigrationNewsArticle.SourceType sourceType,
        @Param("isBreaking") Boolean isBreaking,
        Pageable pageable);
    
    List<ImmigrationNewsArticle> findByStatusAndImpactLevelInAndPublishedAtAfter(
        ImmigrationNewsArticle.Status status, 
        List<ImmigrationNewsArticle.ImpactLevel> impactLevels,
        LocalDateTime after);
    
    List<ImmigrationNewsArticle> findByStatusAndCreatedAtBefore(
        ImmigrationNewsArticle.Status status, LocalDateTime before);
    
    boolean existsBySourceUrlAndStatus(String sourceUrl, ImmigrationNewsArticle.Status status);
}