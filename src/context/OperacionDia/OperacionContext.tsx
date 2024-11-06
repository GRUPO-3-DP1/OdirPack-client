import { createContext, useEffect, useState } from "react";
import { OperacionContextProps } from "./OperacionTypes";
import WebSocketManager from "../../store/webSocketManager";
import { ResponseAlgorithm } from "../../store/types/ResponseAlgorithm";
import usePedidos from '../../store/hooks/usePedidos';

export const OperacionContext = createContext<OperacionContextProps | undefined>(undefined);

export const OperacionProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [ userId, setUserId ] = useState<string>('');
  const { fetchPedidos, pedidos } = usePedidos();
  const [ planificando, setPlanificando] = useState<boolean>(false);

  // @ts-ignore
  const [socketManager, setSocketManager] = useState<WebSocketManager | null>(null);
  //const [solutions, setSolutions] = useState<ResponseAlgorithm[]>([]);

  useEffect(() => {
    // Configurar el WebSocketManager
    const wsManager = new WebSocketManager((data) => {
      if (data.userId) {
        setUserId(data.userId);
        console.log("El id del usuario:", userId);
      } else {
        const newResponse: ResponseAlgorithm = data;
        console.log("Respuesta del Día a Día algoritmo recibida:", newResponse);
        //setSolutions((prevResponses) => [...prevResponses, newResponse]);
      }
    });

    // Conectar el WebSocket
    wsManager.connect();
    setSocketManager(wsManager);

    // Llamar a Pedidos en BD
    fetchPedidos();

    // Cleanup para cerrar el WebSocket al desmontar
    return () => {
      wsManager.close();
    };
  }, []);


  return (
    <OperacionContext.Provider value={{pedidos, planificando, setPlanificando}}>
      {children}
    </OperacionContext.Provider>
  );
};