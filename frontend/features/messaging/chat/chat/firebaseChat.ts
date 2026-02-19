import { 
  ref, 
  push, 
  set, 
  onChildAdded, 
  onChildChanged, 
  onValue, 
  off, 
  query, 
  orderByChild, 
  limitToLast,
  serverTimestamp,
  DatabaseReference,
  Unsubscribe,
  onDisconnect as firebaseOnDisconnect
} from 'firebase/database';
import { realtimeDb, auth } from '../firebase';
import { chatAPI, Message, Chat } from '../api/chat';
import { API_BASE_URL } from '@/shared/constants/api';

export interface FirebaseMessage {
  id?: string;
  chatId: number;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  createdAt: number;
  timestamp?: number;
}

export interface ChatPresence {
  userId: string;
  online: boolean;
  lastSeen?: number;
}

/**
 * Firebase Realtime Database Chat Service
 * Handles real-time messaging using Firebase Realtime Database
 */
class FirebaseChatService {
  private messageListeners: Map<number, Unsubscribe> = new Map();
  private presenceListeners: Map<string, Unsubscribe> = new Map();
  private currentUserId: string | null = null;

  /**
   * Initialize the service with current user
   */
  initialize(userId: string) {
    this.currentUserId = userId;
    this.setupPresence(userId);
  }

  /**
   * Cleanup all listeners
   */
  cleanup() {
    // Remove all message listeners
    this.messageListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.messageListeners.clear();

    // Remove all presence listeners
    this.presenceListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.presenceListeners.clear();

    // Set user offline
    if (this.currentUserId) {
      this.setUserOffline(this.currentUserId);
    }
  }

  /**
   * Setup presence tracking for the current user
   */
  private setupPresence(userId: string) {
    const userStatusRef = ref(realtimeDb, `presence/${userId}`);
    const connectedRef = ref(realtimeDb, '.info/connected');

    // When user connects, set online status
    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        // User is connected
        set(userStatusRef, {
          online: true,
          lastSeen: null,
        });

        // When user disconnects, set offline status
        const disconnectRef = firebaseOnDisconnect(userStatusRef);
        disconnectRef.set({
          online: false,
          lastSeen: serverTimestamp(),
        });
      }
    });
  }

  /**
   * Set user offline manually
   */
  private setUserOffline(userId: string) {
    const userStatusRef = ref(realtimeDb, `presence/${userId}`);
    set(userStatusRef, {
      online: false,
      lastSeen: serverTimestamp(),
    });
  }

  /**
   * Send a message via Firebase Realtime Database
   * Also syncs with backend for persistence
   */
  async sendMessage(chatId: number, content: string, type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'): Promise<void> {
    const user = auth?.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create message object
    const message: FirebaseMessage = {
      chatId,
      senderId: user.uid,
      content,
      type,
      createdAt: Date.now(),
      timestamp: Date.now(),
    };

    // Save to Firebase Realtime Database for real-time delivery
    const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, message);

    // Also sync with backend for persistence and push notifications
    try {
      await chatAPI.sendMessage(chatId, { content, type });
    } catch (error) {
      console.error('Failed to sync message with backend:', error);
      // Message is still in Firebase, so it will be delivered in real-time
    }
  }

  /**
   * Listen to messages for a specific chat
   */
  subscribeToMessages(
    chatId: number,
    onMessage: (message: FirebaseMessage) => void,
    onError?: (error: Error) => void
  ): () => void {
    // Remove existing listener if any
    const existingUnsubscribe = this.messageListeners.get(chatId);
    if (existingUnsubscribe) {
      existingUnsubscribe();
    }

    const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
    const messagesQuery = query(messagesRef, orderByChild('createdAt'), limitToLast(100));

    // Listen for new messages
    const unsubscribe = onChildAdded(messagesQuery, (snapshot) => {
      if (snapshot.exists()) {
        const message = snapshot.val() as FirebaseMessage;
        message.id = snapshot.key || undefined;
        onMessage(message);
      }
    }, (error) => {
      console.error('Error listening to messages:', error);
      onError?.(error);
    });

    this.messageListeners.set(chatId, unsubscribe);

    // Return unsubscribe function
    return () => {
      unsubscribe();
      this.messageListeners.delete(chatId);
    };
  }

  /**
   * Get initial messages from backend and sync to Firebase
   */
  async loadInitialMessages(chatId: number): Promise<Message[]> {
    try {
      const response = await chatAPI.getChatMessages(chatId, 0, 50);
      const messages = response.content;

      // Don't sync to Firebase - let real-time messages come through naturally
      // Firebase will handle real-time updates, backend is for persistence
      return messages;
    } catch (error) {
      console.error('Error loading initial messages:', error);
      return [];
    }
  }

  /**
   * Listen to user's online/offline status
   */
  subscribeToUserPresence(
    userId: string,
    onPresenceChange: (presence: ChatPresence) => void
  ): () => void {
    const presenceRef = ref(realtimeDb, `presence/${userId}`);
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      if (snapshot.exists()) {
        const presence = snapshot.val() as ChatPresence;
        onPresenceChange(presence);
      } else {
        // User is offline
        onPresenceChange({
          userId,
          online: false,
        });
      }
    });

    this.presenceListeners.set(userId, unsubscribe);

    return () => {
      unsubscribe();
      this.presenceListeners.delete(userId);
    };
  }

  /**
   * Get user's current presence status
   */
  async getUserPresence(userId: string): Promise<ChatPresence> {
    return new Promise((resolve) => {
      const presenceRef = ref(realtimeDb, `presence/${userId}`);
      
      onValue(presenceRef, (snapshot) => {
        if (snapshot.exists()) {
          const presence = snapshot.val() as ChatPresence;
          resolve(presence);
        } else {
          resolve({
            userId,
            online: false,
          });
        }
      }, { onlyOnce: true });
    });
  }

  /**
   * Mark message as read (update read receipts)
   */
  async markMessageAsRead(chatId: number, messageId: string, userId: string): Promise<void> {
    const readRef = ref(realtimeDb, `chats/${chatId}/messages/${messageId}/readBy/${userId}`);
    await set(readRef, {
      readAt: Date.now(),
    });
  }

  /**
   * Listen to typing indicators
   */
  subscribeToTyping(
    chatId: number,
    onTypingChange: (userId: string, isTyping: boolean) => void
  ): () => void {
    const typingRef = ref(realtimeDb, `chats/${chatId}/typing`);
    
    const unsubscribe = onValue(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        const typing = snapshot.val();
        Object.keys(typing).forEach((userId) => {
          if (userId !== this.currentUserId) {
            onTypingChange(userId, typing[userId] === true);
          }
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }

  /**
   * Set typing indicator
   */
  async setTyping(chatId: number, isTyping: boolean): Promise<void> {
    if (!this.currentUserId) return;

    const typingRef = ref(realtimeDb, `chats/${chatId}/typing/${this.currentUserId}`);
    if (isTyping) {
      await set(typingRef, true);
      // Auto-remove typing indicator after 3 seconds
      setTimeout(() => {
        set(typingRef, false);
      }, 3000);
    } else {
      await set(typingRef, false);
    }
  }
}

export const firebaseChatService = new FirebaseChatService();

