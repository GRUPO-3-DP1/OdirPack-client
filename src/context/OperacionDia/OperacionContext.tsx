import { createContext, useEffect, useState } from "react";
import { OperacionContextProps } from "./OperacionTypes";
import WebSocketManager from "../../store/webSocketManager";
import { ResponseAlgorithm } from "../../store/types/ResponseAlgorithm";
import usePedidos from '../../store/hooks/usePedidos';

export const OperacionContext = createContext<OperacionContextProps | undefined>(undefined);

export const OperacionProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [userId, setUserId] = useState<string>('');
  const {fetchPedidos, pedidos} = usePedidos();
  const [planificando, setPlanificando] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const speed = 100;
  const simulatedHoursToLog = 3;
  
  // @ts-ignore
  const [socketManager, setSocketManager] = useState<WebSocketManager | null>(null);
    // @ts-ignore
  const [solutions, setSolutions] = useState<ResponseAlgorithm[]>([]); // Arreglo para almacenar respuestas

  useEffect(() => {
    const wsManager = new WebSocketManager((data) => {
      if (data.userId) {
        setUserId(data.userId);
        console.log("El id del usuario:", userId);
      } else {
        const newResponse: ResponseAlgorithm = data;
        console.log("Respuesta del algoritmo recibida:", newResponse);
        setSolutions((prevResponses) => [...prevResponses, newResponse]);
      }
    });

    wsManager.connect();
    setSocketManager(wsManager);
    fetchPedidos();

    return () => {
      wsManager.close();
    };
  }, []);

  const handleIniciarPlanificacion = async () => {
    try {
      setStartTime(new Date());

      let accumulatedSimulatedTime = 0;

      // Intervalo que avanza el tiempo simulado
      const id = setInterval(() => {
        setStartTime(prevTime => {
          if (prevTime) {
            const newTime = new Date(prevTime.getTime() + speed * 1000);
            accumulatedSimulatedTime += speed * 1000;

            // Verificar si han pasado 3 horas simuladas
            if (accumulatedSimulatedTime >= simulatedHoursToLog * 60 * 60 * 1000) {
              console.log("Han pasado 3 horas simuladas desde el inicio");
              accumulatedSimulatedTime = 0;
            }

            return newTime;
          }
          return prevTime;
        });
      }, 1000); // Intervalo de 1 segundo para actualizar el tiempo

      setIntervalId(id);
    } catch (error) {
      console.error('Error al iniciar la planificación:', error);
    }
  };

  useEffect(() => {
    if (planificando) {
      handleIniciarPlanificacion();
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
        setStartTime(null);
      }
    }
  }, [planificando]);

  return (
    <OperacionContext.Provider value={{ pedidos, planificando, setPlanificando, startTime }}>
      {children}
    </OperacionContext.Provider>
  );
};
