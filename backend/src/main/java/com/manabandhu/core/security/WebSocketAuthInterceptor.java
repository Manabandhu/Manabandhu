package com.manabandhu.core.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {
    private final JwtTokenService jwtTokenService;

    public WebSocketAuthInterceptor(JwtTokenService jwtTokenService) {
        this.jwtTokenService = jwtTokenService;
    }

    private final JwtTokenService jwtTokenService = new JwtTokenService("change-me-change-me-change-me-change-me", 3600, 2592000);

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = null;
            List<String> authHeaders = accessor.getNativeHeader("Authorization");
            if (authHeaders != null && !authHeaders.isEmpty()) {
                String authHeader = authHeaders.get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) token = authHeader.substring(7);
            }
            if (token == null) {
                Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                if (sessionAttributes != null && sessionAttributes.containsKey("token")) token = (String) sessionAttributes.get("token");
            }
            if (token == null) throw new RuntimeException("WebSocket connection rejected: No authorization token provided");
            String uid = jwtTokenService.subject(token);
            accessor.setUser(new UsernamePasswordAuthenticationToken(uid, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))));
            log.info("WebSocket connection authenticated for user: {}", uid);
        }
        return message;
    }
}
