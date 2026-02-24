import { apiRequestJson } from "@/shared/api/api-request";
import { API_PATHS } from "@/shared/constants/api-paths";
import { CHAT_API_ERROR_MESSAGES } from "@/shared/constants/api-messages";

export type ChatContext = "ROOM" | "RIDE" | "COMMUNITY" | "GROUP" | "PERSONAL" | "ONE_ON_ONE";

export interface Chat {
  id: number;
  name: string;
  type: "DIRECT" | "GROUP";
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
  type: "TEXT" | "IMAGE" | "FILE";
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
  type?: "TEXT" | "IMAGE" | "FILE";
}

export interface CreateChatRequest {
  name: string;
  type: "DIRECT" | "GROUP";
  participants: string[];
}

const withPaging = (path: string, page: number, size: number): string => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  return `${path}?${params.toString()}`;
};

class ChatAPI {
  async getUserChats(): Promise<Chat[]> {
    return apiRequestJson<Chat[]>(
      API_PATHS.chat.base,
      {},
      { fallbackErrorMessage: CHAT_API_ERROR_MESSAGES.fetchChats }
    );
  }

  async createChat(request: CreateChatRequest): Promise<Chat> {
    return apiRequestJson<Chat>(
      API_PATHS.chat.base,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
      { fallbackErrorMessage: CHAT_API_ERROR_MESSAGES.createChat }
    );
  }

  async getOrCreateDirectChat(userId: string): Promise<Chat> {
    return apiRequestJson<Chat>(
      API_PATHS.chat.directChat(userId),
      {
        method: "POST",
      },
      { fallbackErrorMessage: CHAT_API_ERROR_MESSAGES.getOrCreateDirectChat }
    );
  }

  async getChatMessages(
    chatId: number,
    page = 0,
    size = 20
  ): Promise<{ content: Message[]; totalElements: number }> {
    return apiRequestJson<{ content: Message[]; totalElements: number }>(
      withPaging(API_PATHS.chat.chatMessages(chatId), page, size),
      {},
      { fallbackErrorMessage: CHAT_API_ERROR_MESSAGES.fetchMessages }
    );
  }

  async sendMessage(chatId: number, request: SendMessageRequest): Promise<Message> {
    return apiRequestJson<Message>(
      API_PATHS.chat.chatMessages(chatId),
      {
        method: "POST",
        body: JSON.stringify(request),
      },
      { fallbackErrorMessage: CHAT_API_ERROR_MESSAGES.sendMessage }
    );
  }
}

export const chatAPI = new ChatAPI();
