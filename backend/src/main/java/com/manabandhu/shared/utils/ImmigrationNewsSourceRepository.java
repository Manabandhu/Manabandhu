package com.manabandhu.shared.utils;

import com.manabandhu.modules.immigration.components.model.ImmigrationNewsArticle;
import com.manabandhu.modules.immigration.components.model.ImmigrationNewsSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ImmigrationNewsSourceRepository extends JpaRepository<ImmigrationNewsSource, UUID> {
    
    List<ImmigrationNewsSource> findByEnabledTrue();
    
    List<ImmigrationNewsSource> findByTypeAndEnabledTrue(ImmigrationNewsArticle.SourceType type);
}