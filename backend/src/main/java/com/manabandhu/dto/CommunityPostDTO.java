package com.manabandhu.dto;

import com.manabandhu.modules.community.discussions.components.model.CommunityPost;

public class CommunityPostDTO extends com.manabandhu.shared.dto.CommunityPostDTO {
    public CommunityPostDTO() {
        super();
    }

    public CommunityPostDTO(CommunityPost post) {
        super(post);
    }
}
