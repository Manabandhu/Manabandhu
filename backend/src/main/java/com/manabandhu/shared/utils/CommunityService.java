package com.manabandhu.shared.utils;

import com.manabandhu.dto.CommentDTO;
import com.manabandhu.dto.CommunityPostDTO;
import com.manabandhu.dto.CreateCommentRequest;
import com.manabandhu.modules.messaging.shared.dto.CommunityCommentEvent;
import com.manabandhu.modules.messaging.shared.dto.CommunityPostEvent;
import com.manabandhu.modules.community.discussions.components.model.Comment;
import com.manabandhu.modules.community.discussions.components.model.CommunityPost;
import com.manabandhu.repository.CommentRepository;
import com.manabandhu.repository.CommunityPostRepository;
import com.manabandhu.repository.UserRepository;
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
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WebSocketService webSocketService;

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
        CommunityPostDTO postDTO = new CommunityPostDTO(post);
        
        // Publish WebSocket event
        CommunityPostEvent event = new CommunityPostEvent("CREATED", postDTO);
        webSocketService.broadcastCommunityUpdate(event);
        
        return postDTO;
    }

    public CommunityPostDTO likePost(Long postId) {
        CommunityPost post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setLikes(post.getLikes() + 1);
        post = postRepository.save(post);
        CommunityPostDTO postDTO = new CommunityPostDTO(post);
        
        // Publish WebSocket event
        CommunityPostEvent event = new CommunityPostEvent("LIKED", postDTO);
        webSocketService.broadcastCommunityUpdate(event);
        
        return postDTO;
    }

    public void deletePost(Long postId, String userId) {
        CommunityPost post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (!post.getAuthorId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this post");
        }
        
        CommunityPostDTO postDTO = new CommunityPostDTO(post);
        postRepository.delete(post);
        
        // Publish WebSocket event
        CommunityPostEvent event = new CommunityPostEvent("DELETED", postDTO);
        webSocketService.broadcastCommunityUpdate(event);
    }

    public CommentDTO addComment(Long postId, String authorId, CreateCommentRequest request) {
        CommunityPost post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setAuthorId(authorId);
        comment.setContent(request.getContent());
        comment = commentRepository.save(comment);
        
        // Update post comment count
        post.setComments(post.getComments() + 1);
        postRepository.save(post);
        
        // Get author name
        String authorName = userRepository.findByFirebaseUid(authorId)
            .map(user -> user.getName())
            .orElse("Anonymous");
        
        CommentDTO commentDTO = new CommentDTO(comment, authorName);
        
        // Publish WebSocket event
        CommunityCommentEvent event = new CommunityCommentEvent("CREATED", commentDTO, postId);
        webSocketService.broadcastCommunityUpdate(event);
        
        return commentDTO;
    }

    public Page<CommentDTO> getPostComments(Long postId, Pageable pageable) {
        Page<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId, pageable);
        return comments.map(comment -> {
            String authorName = userRepository.findByFirebaseUid(comment.getAuthorId())
                .map(user -> user.getName())
                .orElse("Anonymous");
            return new CommentDTO(comment, authorName);
        });
    }

    public void deleteComment(Long commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getAuthorId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this comment");
        }
        
        // Update post comment count
        CommunityPost post = postRepository.findById(comment.getPostId())
            .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setComments(Math.max(0, post.getComments() - 1));
        postRepository.save(post);
        
        Long postId = comment.getPostId();
        CommentDTO commentDTO = new CommentDTO(comment, 
            userRepository.findByFirebaseUid(comment.getAuthorId())
                .map(user -> user.getName())
                .orElse("Anonymous"));
        
        commentRepository.delete(comment);
        
        // Publish WebSocket event
        CommunityCommentEvent event = new CommunityCommentEvent("DELETED", commentDTO, postId);
        webSocketService.broadcastCommunityUpdate(event);
    }
}