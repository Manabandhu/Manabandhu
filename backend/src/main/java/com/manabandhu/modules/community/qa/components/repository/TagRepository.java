package com.manabandhu.modules.community.qa.components.repository;

import com.manabandhu.modules.community.qa.components.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {

    List<Tag> findByIsSystemTagTrueOrderByName();
    
    List<Tag> findByCategoryOrderByName(Tag.TagCategory category);
    
    boolean existsByName(String name);
}