# Chat Performance Review & Optimizations

## Executive Summary

This document outlines performance issues identified in the chat functionality and the optimizations implemented to address them. The review covers both backend (Java/Spring Boot) and frontend (React Native/TypeScript) components.

## Issues Identified

### Backend Performance Issues

#### 1. **Missing Database Indexes** ⚠️ CRITICAL
- **Issue**: No indexes on frequently queried columns
  - `chat_participants.user_id` - used in `findByParticipantsContaining`
  - `messages.chat_id` and `messages.created_at` - used in message pagination
  - `chats.last_message_at` - used in chat ordering
- **Impact**: Full table scans on large datasets, slow query performance
- **Fix**: Added comprehensive indexes in migration `V11__Add_Chat_Performance_Indexes.sql`

#### 2. **Inefficient Chat Repository Queries** ⚠️ HIGH
- **Issue**: 
  - `findByParticipantsContaining` used JOIN on ElementCollection which is inefficient
  - `findDirectChatBetweenUsers` used `MEMBER OF` which performs poorly on large collections
- **Impact**: Slow chat list loading, especially for users with many chats
- **Fix**: Optimized queries using subqueries instead of JOIN/MEMBER OF operations

#### 3. **N+1 Query Problem in getUserChats** ⚠️ HIGH
- **Issue**: `getUserChats()` didn't populate `lastMessage`, causing frontend to make additional queries or show empty last messages
- **Impact**: Multiple database queries per chat, poor user experience
- **Fix**: Added efficient batch query `findLastMessageByChatIds` to fetch all last messages in a single query

#### 4. **Inefficient sendMessage Implementation** ⚠️ MEDIUM
- **Issue**: Two separate database queries (findById + save) instead of optimizing the transaction
- **Impact**: Extra database round-trip on every message send
- **Fix**: Reordered operations to fetch chat once, then save message and update chat

#### 5. **Missing Pagination for getUserChats** ⚠️ MEDIUM
- **Issue**: `getUserChats()` loads all chats without pagination
- **Impact**: Performance degrades as users accumulate more chats
- **Note**: Consider adding pagination in future if chat count grows significantly

### Frontend Performance Issues

#### 1. **Repeated getAllUsers API Calls** ⚠️ HIGH
- **Issue**: `getAllUsers()` called multiple times without caching:
  - Called in chat list (`chat.tsx`)
  - Called again in conversation view (`conversation.tsx`)
  - Called every time user opens a chat
- **Impact**: Unnecessary network requests, slow UI updates
- **Fix**: Added in-memory cache with 5-minute TTL in `userApi.getAllUsers()`

#### 2. **No Message Pagination/Infinite Scroll** ⚠️ MEDIUM
- **Issue**: 
  - `loadInitialMessages` loads only 50 messages
  - Firebase listener limits to 100 messages
  - No way to load older messages
- **Impact**: Users can't see full conversation history
- **Fix**: Added infinite scroll with pagination support (20 messages per page)

#### 3. **Inefficient User Data Loading** ⚠️ MEDIUM
- **Issue**: Loading all users even when only need a few participants
- **Impact**: Large payloads, unnecessary data transfer
- **Note**: Current fix (caching) helps, but consider adding endpoint to fetch users by IDs in future

## Optimizations Implemented

### Backend Changes

1. **Database Migration: V11__Add_Chat_Performance_Indexes.sql**
   ```sql
   -- Indexes added:
   - idx_chat_participants_user_id (chat_participants.user_id)
   - idx_messages_chat_id (messages.chat_id)
   - idx_messages_chat_id_created_at (messages.chat_id, created_at DESC)
   - idx_chats_last_message_at (chats.last_message_at DESC NULLS LAST)
   - idx_chats_type_last_message_at (composite index)
   ```

2. **ChatService.java Optimizations**
   - `getUserChats()`: Now efficiently loads last messages using batch query
   - `sendMessage()`: Optimized to reduce database queries
   - Added `findLastMessageByChatIds()` method to MessageRepository

3. **ChatRepository.java Optimizations**
   - Replaced JOIN on ElementCollection with subquery approach
   - Replaced MEMBER OF with IN subquery for better performance
   - Queries now leverage the new database indexes

4. **MessageRepository.java**
   - Added `findLastMessageByChatIds()` using window function for efficient batch loading

### Frontend Changes

1. **userApi.ts - User Caching**
   - Added in-memory cache with 5-minute TTL
   - Cache automatically cleared on user profile updates
   - Fallback to stale cache on API failures

2. **conversation.tsx - Infinite Scroll**
   - Added pagination support (20 messages per page)
   - Implemented infinite scroll when user scrolls to top
   - Loading indicator for older messages
   - Prevents auto-scroll when loading older messages

## Performance Improvements Expected

### Backend
- **Chat List Loading**: 50-70% faster with indexes and optimized queries
- **Message Sending**: 10-20% faster with reduced database queries
- **Last Message Loading**: 80-90% faster (from N queries to 1 batch query)

### Frontend
- **User Data Loading**: 100% faster on cached requests (no network call)
- **Chat List Rendering**: Faster due to cached user data
- **Message History**: Users can now access full conversation history

## Recommendations for Future Improvements

### High Priority
1. **Add Pagination to getUserChats**: If users have 100+ chats, add pagination
2. **User Fetching by IDs**: Create endpoint to fetch specific users by IDs instead of all users
3. **Message Deduplication**: Improve Firebase/Backend message sync to prevent duplicates

### Medium Priority
1. **Caching Strategy**: Consider Redis for distributed caching if scaling horizontally
2. **WebSocket Optimization**: Review WebSocket message broadcasting for large group chats
3. **Push Notification Batching**: Batch push notifications for better performance

### Low Priority
1. **Message Search**: Add full-text search capability for messages
2. **Read Receipts Optimization**: Optimize read receipt tracking if implemented
3. **Typing Indicators**: Optimize typing indicator updates

## Testing Recommendations

1. **Load Testing**: Test with users having 100+ chats
2. **Message Volume**: Test with chats containing 1000+ messages
3. **Concurrent Users**: Test with 100+ concurrent chat users
4. **Network Conditions**: Test caching behavior under poor network conditions

## Migration Notes

- Database migration `V11__Add_Chat_Performance_Indexes.sql` is backward compatible
- No breaking changes to API contracts
- Frontend changes are backward compatible
- Cache will populate on first use after deployment

## Monitoring

Recommended metrics to monitor:
- Average response time for `getUserChats` endpoint
- Database query execution times
- Cache hit rate for user data
- Message pagination usage
- Firebase listener connection stability

