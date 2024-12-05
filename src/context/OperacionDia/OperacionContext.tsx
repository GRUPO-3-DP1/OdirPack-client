import { createContext, useEffect, useState } from "react";
import { OperacionContextProps } from "./operacionTypes";
import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { dataPrueba } from "../../data/dataPruebaOp";

export const OperacionContext = createContext<OperacionContextProps | undefined>(undefined);

export const OperacionProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [planificando, setPlanificando] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const speed = 400;
  const simulatedHoursToLog = 3;

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
              handleOperacionDiaADia();
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

  // Servicio De OpD
  const handleOperacionDiaADia = async () => {
    try {
      const response = await axios.post(
        `${ServicesProperties.BaseUrl}/operacionDia/iniciar/`, dataPrueba,
        { headers: ServicesProperties.Headers }
      );
      console.log('Inicio Op', response.data);
    } catch (error) {
      console.error('Error al iniciar Op:', error);
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
    <OperacionContext.Provider value={{ planificando, setPlanificando, startTime }}>
      {children}
    </OperacionContext.Provider>
  );
};