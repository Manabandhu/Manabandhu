package com.manabandhu.dto;

import com.manabandhu.model.community.CommunityPost;
import java.time.LocalDateTime;
import java.util.List;

public class CommunityPostDTO {
    private Long id;
    private String authorId;
    private String authorName;
    private String content;
    private List<String> images;
    private Integer likes;
    private Integer comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isLiked;

    public CommunityPostDTO() {}

    public CommunityPostDTO(CommunityPost post) {
        this.id = post.getId();
        this.authorId = post.getAuthorId();
        this.content = post.getContent();
        this.images = post.getImages();
        this.likes = post.getLikes();
        this.comments = post.getComments();
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public Integer getLikes() { return likes; }
    public void setLikes(Integer likes) { this.likes = likes; }

    public Integer getComments() { return comments; }
    public void setComments(Integer comments) { this.comments = comments; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public boolean isLiked() { return isLiked; }
    public void setLiked(boolean liked) { isLiked = liked; }
}

class CreatePostRequest {
    private String content;
    private List<String> images;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}