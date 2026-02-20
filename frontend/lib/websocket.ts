import { auth } from '@/services/auth';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

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
  private client: Client | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<WebSocketMessageType, Set<MessageHandler>> = new Map();
  private isConnecting = false;
  private isConnected = false;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private userId: string | null = null;

  async connect(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.isConnecting = true;

    try {
      const user = auth?.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Force token refresh to ensure we have a valid, non-expired token
      const token = await user.getIdToken(true);
      this.userId = user.uid;

      // Create STOMP client with React Native WebSocket
      const wsUrl = `${WS_BASE_URL}/ws?token=${encodeURIComponent(token)}`;
      console.log('Connecting to WebSocket:', wsUrl.replace(/token=[^&]+/, 'token=***'));
      
      this.client = new Client({
        webSocketFactory: () => {
          const ws = new WebSocket(wsUrl);
          
          // Add WebSocket event listeners for debugging
          ws.onopen = () => {
            console.log('WebSocket opened, waiting for STOMP handshake...');
          };
          
          ws.onerror = (error) => {
            console.error('Raw WebSocket error:', error);
            // Log more details if available
            if (error instanceof Error) {
              console.error('WebSocket error details:', error.message, error.stack);
            }
          };
          
          ws.onclose = (event) => {
            const closeInfo = {
              code: event.code,
              reason: event.reason || 'No reason provided',
              wasClean: event.wasClean,
            };
            console.log('Raw WebSocket closed:', closeInfo);
            
            // Log specific close codes for debugging
            if (event.code === 1006) {
              console.error('WebSocket closed abnormally (1006) - connection lost without close frame');
            } else if (event.code === 1002) {
              console.error('WebSocket closed due to protocol error (1002)');
            } else if (event.code === 1003) {
              console.error('WebSocket closed due to unsupported data (1003)');
            } else if (event.code === 1008) {
              console.error('WebSocket closed due to policy violation (1008) - possibly authentication failure');
            }
          };
          
          return ws as any;
        },
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          if (__DEV__) {
            console.log('STOMP:', str);
          }
        },
      });

      this.client.onConnect = (frame) => {
        console.log('WebSocket STOMP connected successfully');
        console.log('STOMP frame:', frame);
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Subscribe to user-specific queues
        if (this.userId) {
          this.subscribeToUserQueues();
        }
      };

      this.client.onStompError = (frame) => {
        console.error('STOMP error occurred:');
        console.error('STOMP error frame:', frame);
        console.error('STOMP error headers:', frame.headers);
        console.error('STOMP error message:', frame.message);
        console.error('STOMP error body:', frame.body);
        
        // Check if it's an authentication error
        const errorMessage = frame.message || frame.body || '';
        if (errorMessage.toLowerCase().includes('auth') || 
            errorMessage.toLowerCase().includes('unauthorized') ||
            errorMessage.toLowerCase().includes('token')) {
          console.error('Authentication error detected - token may be invalid or expired');
          // Don't attempt reconnect for auth errors - user needs to re-authenticate
          this.isConnecting = false;
          this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
        } else {
          this.isConnecting = false;
        }
      };

      this.client.onWebSocketError = (error) => {
        console.error('WebSocket error:', error);
        // Log error details if available
        if (error instanceof Error) {
          console.error('WebSocket error details:', error.message, error.stack);
        }
        // Don't set isConnecting to false here - let onDisconnect handle it
        // This allows the STOMP client to attempt reconnection
      };

      this.client.onDisconnect = () => {
        console.log('WebSocket STOMP disconnected');
        this.isConnected = false;
        this.isConnecting = false;
        this.subscriptions.clear();
        
        // Only attempt reconnect if we haven't exceeded max attempts
        // and it's not an authentication error
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        } else {
          console.error('Max reconnection attempts reached or authentication failed');
        }
      };

      this.client.activate();
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      if (error instanceof Error) {
        console.error('Connection error details:', error.message, error.stack);
      }
      this.isConnecting = false;
      
      // Only attempt reconnect if it's not an authentication error
      if (!(error instanceof Error && error.message.includes('authenticated'))) {
        this.attemptReconnect();
      }
    }
  }

  private subscribeToUserQueues() {
    if (!this.client || !this.userId) return;

    // Subscribe to chat messages
    const chatSubscription = this.client.subscribe(
      `/user/${this.userId}/queue/chat/messages`,
      (message: IMessage) => {
        try {
          const data: WebSocketMessage = JSON.parse(message.body);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing chat message:', error);
        }
      }
    );
    this.subscriptions.set('chat', chatSubscription);

    // Subscribe to notifications
    const notificationSubscription = this.client.subscribe(
      `/user/${this.userId}/queue/notifications`,
      (message: IMessage) => {
        try {
          const data: WebSocketMessage = JSON.parse(message.body);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      }
    );
    this.subscriptions.set('notifications', notificationSubscription);

    // Subscribe to ride updates
    const rideSubscription = this.client.subscribe(
      `/user/${this.userId}/queue/rides/updates`,
      (message: IMessage) => {
        try {
          const data: WebSocketMessage = JSON.parse(message.body);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing ride update:', error);
        }
      }
    );
    this.subscriptions.set('rides', rideSubscription);

    // Subscribe to room updates
    const roomSubscription = this.client.subscribe(
      `/user/${this.userId}/queue/rooms/updates`,
      (message: IMessage) => {
        try {
          const data: WebSocketMessage = JSON.parse(message.body);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing room update:', error);
        }
      }
    );
    this.subscriptions.set('rooms', roomSubscription);
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

  send(destination: string, message: any): void {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(message),
      });
    } else {
      console.warn('WebSocket is not connected. Message not sent.');
    }
  }

  disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.messageHandlers.clear();
  }

  get connected(): boolean {
    return this.isConnected && this.client?.connected === true;
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

