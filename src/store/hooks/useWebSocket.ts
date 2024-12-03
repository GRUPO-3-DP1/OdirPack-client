import { useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
  url: string;
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = ({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
}: UseWebSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [allowReconnect, setAllowReconnect] = useState(true); // Control de reconexión

  const reconnectInterval = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connectWebSocket = () => {
    if (!allowReconnect) return; // Evitar reconexiones no deseadas

    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0; // Resetear intentos
      if (onOpen) onOpen();
    };

    wsRef.current.onmessage = (event) => {
      if (onMessage) onMessage(JSON.parse(event.data));
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      if (onClose) onClose();

      // Intentar reconectar solo si está permitido
      if (allowReconnect) {
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectInterval.current = window.setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket();
          }, 2000); // Intentar cada 2 segundos
        }
      }
    };

    wsRef.current.onerror = (error) => {
      if (onError) onError(error);
    };
  };

  const closeWebSocket = () => {
    setAllowReconnect(false); // Deshabilitar reconexiones
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectInterval.current) {
        clearTimeout(reconnectInterval.current);
      }
      closeWebSocket();
    };
  }, [url, allowReconnect]);

  return { isConnected, closeWebSocket, reconnect: () => setAllowReconnect(false) };
};
