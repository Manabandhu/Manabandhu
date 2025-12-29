-- Add indexes for chat performance optimization
-- These indexes will significantly improve query performance for chat-related operations

-- Index for chat_participants table (used in findByParticipantsContaining)
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);

-- Index for messages table (used in findByChatIdOrderByCreatedAtDesc)
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id_created_at ON messages(chat_id, created_at DESC);

-- Index for chats table (used in ordering by lastMessageAt)
CREATE INDEX IF NOT EXISTS idx_chats_last_message_at ON chats(last_message_at DESC NULLS LAST);

-- Composite index for direct chat lookup optimization
CREATE INDEX IF NOT EXISTS idx_chats_type_last_message_at ON chats(type, last_message_at DESC NULLS LAST);

