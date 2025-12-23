package com.manabandhu.controller;

import com.manabandhu.dto.CommunityPostDTO;
import com.manabandhu.service.CommunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "*")
public class CommunityController {

    @Autowired
    private CommunityService communityService;

    @GetMapping("/posts")
    public ResponseEntity<Page<CommunityPostDTO>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<CommunityPostDTO> posts = communityService.getAllPosts(page, size);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/posts/user/{userId}")
    public ResponseEntity<Page<CommunityPostDTO>> getUserPosts(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<CommunityPostDTO> posts = communityService.getUserPosts(userId, page, size);
        return ResponseEntity.ok(posts);
    }

    @PostMapping("/posts")
    public ResponseEntity<CommunityPostDTO> createPost(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        String authorId = authentication.getName();
        String content = (String) request.get("content");
        @SuppressWarnings("unchecked")
        List<String> images = (List<String>) request.getOrDefault("images", List.of());
        
        CommunityPostDTO post = communityService.createPost(authorId, content, images);
        return ResponseEntity.ok(post);
    }

    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<CommunityPostDTO> likePost(@PathVariable Long postId) {
        CommunityPostDTO post = communityService.likePost(postId);
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long postId,
            Authentication authentication) {
        String userId = authentication.getName();
        communityService.deletePost(postId, userId);
        return ResponseEntity.ok().build();
    }
}