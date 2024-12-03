import { useEffect, useRef, useState } from 'react';
import { SolucionAlgorithmResponse } from '../types/ResponseAlgorithm';

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

  const reconnectInterval = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = () => {
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      console.log('WebSocket conectado a', url);
      setIsConnected(true);
      reconnectAttempts.current = 0; // Resetear intentos
      onOpen?.();
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Mensaje recibido:', data);
      onMessage?.(data);
      // ver si está enviando los averiados planificados bien
      (data.solucion as SolucionAlgorithmResponse[]).forEach((solucion) => {
        Object.values(solucion.rutasVehiculos).forEach((rutaVehiculo) => {
          if(rutaVehiculo.isAveriado){
            console.log('Averiado:', rutaVehiculo.idVehiculo);
          }
          
        });
      });      
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket cerrado');
      setIsConnected(false);
      onClose?.();

      // Intentar reconexión
      if (reconnectAttempts.current < 5) {
        reconnectAttempts.current += 1;
        reconnectInterval.current = window.setTimeout(() => {
          console.log(`Intentando reconexión (#${reconnectAttempts.current})...`);
          connect();
        }, 3000);
      } else {
        console.error('No se pudo reconectar después de múltiples intentos.');
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    };
  };

  useEffect(() => {
    connect();

    return () => {
      wsRef.current?.close();
      if (reconnectInterval.current) {
        clearTimeout(reconnectInterval.current);
      }
    };
  }, [url]);

  const sendMessage = (message: any) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('No se puede enviar el mensaje. WebSocket no conectado.');
    }
  };

  const closeWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      setIsConnected(false);
      if (reconnectInterval.current) {
        clearTimeout(reconnectInterval.current);
      }
      //createNewConnection();
    }
  };

  // const createNewConnection = () => {
  //   if (wsRef.current) {
  //     wsRef.current.close();
  //   }
  //   connect();
  // };

  return { isConnected, sendMessage, closeWebSocket };
};
