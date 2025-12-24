package com.manabandhu.repository;

import com.manabandhu.model.immigration.ImmigrationNewsSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ImmigrationNewsSourceRepository extends JpaRepository<ImmigrationNewsSource, UUID> {
    
    List<ImmigrationNewsSource> findByEnabledTrue();
    
    List<ImmigrationNewsSource> findByTypeAndEnabledTrue(ImmigrationNewsSource.SourceType type);
}