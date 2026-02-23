declare module '@stomp/stompjs' {
  export interface IMessage {
    body: string;
    headers?: Record<string, string>;
  }

  export interface IFrame {
    headers: Record<string, string>;
    body: string;
    message?: string;
  }

  export interface StompSubscription {
    unsubscribe(): void;
  }

  export class Client {
    connected: boolean;
    onConnect?: (frame: IFrame) => void;
    onStompError?: (frame: IFrame) => void;
    onWebSocketError?: (error: unknown) => void;
    onDisconnect?: () => void;

    constructor(options?: Record<string, unknown>);
    activate(): void;
    deactivate(): void;
    publish(args: { destination: string; body: string }): void;
    subscribe(
      destination: string,
      callback: (message: IMessage) => void
    ): StompSubscription;
  }
}
