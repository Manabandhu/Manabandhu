package com.manabandhu.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = null;
            
            // Try to get token from Authorization header first
            List<String> authHeaders = accessor.getNativeHeader("Authorization");
            if (authHeaders != null && !authHeaders.isEmpty()) {
                String authHeader = authHeaders.get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }
            
            // Fallback: try to get token from query parameters (for plain WebSocket)
            if (token == null) {
                Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                if (sessionAttributes != null && sessionAttributes.containsKey("token")) {
                    token = (String) sessionAttributes.get("token");
                }
            }
            
            if (token != null) {
                try {
                    // Verify Firebase token
                    FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                    String uid = decodedToken.getUid();
                    
                    // Create authentication object
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(
                            uid, 
                            null, 
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                        );
                    
                    // Set the user in the accessor
                    accessor.setUser(authentication);
                    log.info("WebSocket connection authenticated for user: {}", uid);
                } catch (com.google.firebase.auth.FirebaseAuthException e) {
                    log.error("Failed to authenticate WebSocket connection - Firebase auth error: {}", e.getMessage());
                    log.error("Error code: {}", e.getErrorCode());
                    // Throw exception to reject the connection
                    throw new RuntimeException("WebSocket authentication failed: " + e.getMessage(), e);
                } catch (Exception e) {
                    log.error("Failed to authenticate WebSocket connection - Unexpected error: {}", e.getMessage(), e);
                    // Throw exception to reject the connection
                    throw new RuntimeException("WebSocket authentication failed: " + e.getMessage(), e);
                }
            } else {
                log.warn("WebSocket connection attempt without authorization token");
                // Reject connection if no token provided
                throw new RuntimeException("WebSocket connection rejected: No authorization token provided");
            }
        }
        
        return message;
    }
}

