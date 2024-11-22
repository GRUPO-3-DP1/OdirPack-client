import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onMessage?: (message: MessageEvent) => void;
  onError?: (error: Event) => void;
  shouldReconnect?: (event: CloseEvent) => boolean;
  reconnectInterval?: number;
}

interface UseWebSocketReturn {
  sendMessage: (message: string) => void;
  lastMessage: MessageEvent | null;
  readyState: WebSocket['readyState'];
  closeWebSocket: () => void;
}

export const useWebSocket = (url: string, options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const { onOpen, onClose, onMessage, onError, shouldReconnect, reconnectInterval = 3000 } = options;

  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [readyState, setReadyState] = useState<WebSocket['readyState']>(WebSocket.CLOSED);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Function to connect WebSocket
  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = (event) => {
      setReadyState(ws.readyState);
      onOpen?.(event);
    };

    ws.onclose = (event) => {
      setReadyState(ws.readyState);
      onClose?.(event);

      if (shouldReconnect?.(event)) {
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, reconnectInterval);
      }
    };

    ws.onmessage = (message) => {
      setLastMessage(message);
      onMessage?.(message);
    };

    ws.onerror = (error) => {
      onError?.(error);
    };
  }, [url, onOpen, onClose, onMessage, onError, shouldReconnect, reconnectInterval]);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      console.warn('WebSocket is not open. Cannot send message:', message);
    }
  }, []);

  const closeWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      closeWebSocket();
    };
  }, [connectWebSocket, closeWebSocket]);

  return {
    sendMessage,
    lastMessage,
    readyState,
    closeWebSocket,
  };
};