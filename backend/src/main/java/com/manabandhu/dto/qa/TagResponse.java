package com.manabandhu.dto.qa;

import com.manabandhu.model.qa.Tag;
import lombok.Data;

import java.util.UUID;

@Data
public class TagResponse {
    private UUID id;
    private String name;
    private Tag.TagCategory category;
    private Boolean isSystemTag;
}