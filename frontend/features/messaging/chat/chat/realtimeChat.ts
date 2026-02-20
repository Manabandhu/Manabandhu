import { chatAPI, Message } from '@/shared/api/chat';

export interface RealtimeMessage {
  id?: string;
  chatId: number;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  createdAt: number;
}

export interface UserPresence {
  userId: string;
  online: boolean;
  lastSeen?: number;
}

class RealtimeChatService {
  private currentUserId: string | null = null;
  private intervals: Map<number, ReturnType<typeof setInterval>> = new Map();

  initialize(userId: string) { this.currentUserId = userId; }
  cleanup() { this.intervals.forEach(clearInterval); this.intervals.clear(); }

  async sendMessage(chatId: number, content: string, type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT') {
    await chatAPI.sendMessage(chatId, { content, type });
  }

  subscribeToMessages(chatId: number, onMessage: (m: RealtimeMessage) => void, onError?: (e: Error) => void) {
    let lastSeenId = 0;
    const poll = async () => {
      try {
        const response = await chatAPI.getChatMessages(chatId, 0, 20);
        const items = [...response.content].reverse();
        items.forEach((msg: Message) => {
          if (msg.id > lastSeenId) {
            lastSeenId = msg.id;
            onMessage({ id: msg.id.toString(), chatId: msg.chatId, senderId: msg.senderId, content: msg.content, type: msg.type, createdAt: new Date(msg.createdAt).getTime() });
          }
        });
      } catch (error) {
        onError?.(error as Error);
      }
    };
    void poll();
    const timer = setInterval(poll, 5000);
    this.intervals.set(chatId, timer);
    return () => {
      clearInterval(timer);
      this.intervals.delete(chatId);
    };
  }

  subscribeToUserPresence(userId: string, onPresenceChange: (p: UserPresence) => void) {
    onPresenceChange({ userId, online: false });
    return () => undefined;
  }
}

export const realtimeChatService = new RealtimeChatService();
