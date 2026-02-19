import { API_BASE_URL } from '@/shared/constants/api';
import { useAuthStore } from '@/store/auth.store';
import { auth } from '@/lib/firebase';

export type ChatContext = 'ROOM' | 'RIDE' | 'COMMUNITY' | 'GROUP' | 'PERSONAL' | 'ONE_ON_ONE';

export interface Chat {
  id: number;
  name: string;
  type: 'DIRECT' | 'GROUP';
  context?: ChatContext;
  participants: string[];
  createdAt: string;
  lastMessageAt?: string;
  lastMessage?: Message;
}

export interface Message {
  id: number;
  chatId: number;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE';
}

export interface CreateChatRequest {
  name: string;
  type: 'DIRECT' | 'GROUP';
  participants: string[];
}

class ChatAPI {
  private async getAuthHeaders() {
    const token = await auth?.currentUser?.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getUserChats(): Promise<Chat[]> {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      headers: await this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch chats');
    return response.json();
  }

  async createChat(request: CreateChatRequest): Promise<Chat> {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to create chat');
    return response.json();
  }

  async getOrCreateDirectChat(userId: string): Promise<Chat> {
    const response = await fetch(`${API_BASE_URL}/api/chat/direct/${userId}`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get/create direct chat');
    return response.json();
  }

  async getChatMessages(chatId: number, page = 0, size = 20): Promise<{ content: Message[]; totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages?page=${page}&size=${size}`, {
      headers: await this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  }

  async sendMessage(chatId: number, request: SendMessageRequest): Promise<Message> {
    const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  }
}

export const chatAPI = new ChatAPI();