package com.manabandhu.repository.qa;

import com.manabandhu.model.qa.Tag;
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