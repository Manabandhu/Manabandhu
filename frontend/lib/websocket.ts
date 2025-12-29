import { auth } from '@/lib/firebase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:9090';
const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

export type WebSocketMessageType = 
  | 'CHAT_MESSAGE'
  | 'NOTIFICATION'
  | 'COMMUNITY_POST'
  | 'COMMUNITY_COMMENT'
  | 'RIDE_UPDATE'
  | 'ROOM_UPDATE'
  | 'QA_UPDATE';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  timestamp: number;
  [key: string]: any;
}

export interface ChatMessageEvent extends WebSocketMessage {
  type: 'CHAT_MESSAGE';
  message: {
    id: number;
    chatId: number;
    senderId: string;
    content: string;
    type: string;
    createdAt: string;
  };
  chatId: number;
}

export interface NotificationEvent extends WebSocketMessage {
  type: 'NOTIFICATION';
  notificationType: string;
  title: string;
  body: string;
  data: Record<string, any>;
  userId: string;
}

export interface CommunityPostEvent extends WebSocketMessage {
  type: 'COMMUNITY_POST';
  action: 'CREATED' | 'UPDATED' | 'DELETED' | 'LIKED';
  post: any;
}

export interface CommunityCommentEvent extends WebSocketMessage {
  type: 'COMMUNITY_COMMENT';
  action: 'CREATED' | 'DELETED';
  comment: any;
  postId: number;
}

export interface RideUpdateEvent extends WebSocketMessage {
  type: 'RIDE_UPDATE';
  action: string;
  ride?: any;
  rideId?: string;
}

export interface RoomUpdateEvent extends WebSocketMessage {
  type: 'ROOM_UPDATE';
  action: string;
  room?: any;
  roomId?: string;
}

export interface QaUpdateEvent extends WebSocketMessage {
  type: 'QA_UPDATE';
  action: string;
  question?: any;
  answer?: any;
  questionId?: string;
  answerId?: string;
}

type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<WebSocketMessageType, Set<MessageHandler>> = new Map();
  private isConnecting = false;
  private isConnected = false;

  async connect(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const wsUrl = `${WS_BASE_URL}/ws?token=${encodeURIComponent(token)}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.isConnecting = false;
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      if (!this.isConnected && !this.isConnecting) {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect();
      }
    }, delay);
  }

  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }
  }

  subscribe<T extends WebSocketMessage>(
    messageType: WebSocketMessageType,
    handler: (message: T) => void
  ): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    
    const handlers = this.messageHandlers.get(messageType)!;
    handlers.add(handler as MessageHandler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler as MessageHandler);
    };
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent.');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.messageHandlers.clear();
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
export const websocketClient = new WebSocketClient();

// Helper function to connect when user is authenticated
export async function connectWebSocket(): Promise<void> {
  const user = auth?.currentUser;
  if (user) {
    await websocketClient.connect();
  }
}

// Helper function to disconnect
export function disconnectWebSocket(): void {
  websocketClient.disconnect();
}

