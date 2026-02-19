package com.manabandhu.modules.community.qa.components.repository;

import com.manabandhu.modules.community.qa.components.model.QaActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface QaActivityRepository extends JpaRepository<QaActivity, UUID> {

    Page<QaActivity> findAllByOrderByCreatedAtDesc(Pageable pageable);
}