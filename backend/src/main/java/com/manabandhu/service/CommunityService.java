package com.manabandhu.service;

import com.manabandhu.dto.CommunityPostDTO;
import com.manabandhu.model.community.CommunityPost;
import com.manabandhu.repository.CommunityPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CommunityService {

    @Autowired
    private CommunityPostRepository postRepository;

    public Page<CommunityPostDTO> getAllPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CommunityPost> posts = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        return posts.map(CommunityPostDTO::new);
    }

    public Page<CommunityPostDTO> getUserPosts(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CommunityPost> posts = postRepository.findByAuthorIdOrderByCreatedAtDesc(userId, pageable);
        return posts.map(CommunityPostDTO::new);
    }

    public CommunityPostDTO createPost(String authorId, String content, List<String> images) {
        CommunityPost post = new CommunityPost(authorId, content, images);
        post = postRepository.save(post);
        return new CommunityPostDTO(post);
    }

    public CommunityPostDTO likePost(Long postId) {
        CommunityPost post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setLikes(post.getLikes() + 1);
        post = postRepository.save(post);
        return new CommunityPostDTO(post);
    }

    public void deletePost(Long postId, String userId) {
        CommunityPost post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (!post.getAuthorId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this post");
        }
        
        postRepository.delete(post);
    }
}