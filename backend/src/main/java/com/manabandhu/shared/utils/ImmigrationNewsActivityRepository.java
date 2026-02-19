package com.manabandhu.shared.utils;

import com.manabandhu.modules.immigration.components.model.ImmigrationNewsActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ImmigrationNewsActivityRepository extends JpaRepository<ImmigrationNewsActivity, UUID> {
    
    List<ImmigrationNewsActivity> findTop10ByOrderByCreatedAtDesc();
}