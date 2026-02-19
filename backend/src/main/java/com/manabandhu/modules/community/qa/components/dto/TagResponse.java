package com.manabandhu.modules.community.qa.components.dto;

import com.manabandhu.modules.community.qa.components.model.Tag;
import lombok.Data;

import java.util.UUID;

@Data
public class TagResponse {
    private UUID id;
    private String name;
    private Tag.TagCategory category;
    private Boolean isSystemTag;
}