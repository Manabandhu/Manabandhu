package com.manabandhu.repository.splitly;

import com.manabandhu.model.User;
import com.manabandhu.model.splitly.SplitGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SplitGroupRepository extends JpaRepository<SplitGroup, Long> {
    List<SplitGroup> findByMembersContaining(User user);
    List<SplitGroup> findByCreatedBy(User user);
}