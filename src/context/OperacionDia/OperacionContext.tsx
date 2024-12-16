import React, { createContext, useReducer, useEffect, useRef } from 'react';
import { OperacionState, OperacionAction, OperacionContextType } from './operacionTypes';
import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { dataPrueba } from '../../data/dataPruebaOp';

const initialState: OperacionState = {
  isActive: false,
  speed: 200, // 1 segundo real = 200 segundos simulados
  simulationTime: new Date(),
  lastPlanificationTime: null, // Comienza sin planificación previa

  isPlaying: false,
  startTime: new Date(),
  currentTime: new Date(),
  currentBloqueos: [],
  vehicles: [],
  offices: [],
  pedidos: [],
  unplannedOrders: [],
  processedOrderIds: [],
  trucksInMotion: 0,
  trucksInMaintenance: 0,
  totalTrucks: 0,
  totalOffices: 0,
  occupiedOffices: 0,
  ordersDelivered: 0,
  ordersPending: 0,
};

const operacionReducer = (state: OperacionState, action: OperacionAction): OperacionState => {
  switch (action.type) {
    case 'START_OPERACION':
      return {
        ...state,
        isActive: true,
        simulationTime: action.payload.initialTime,
        lastPlanificationTime: action.payload.initialTime, // Inicializa planificación al iniciar
      };
    case 'STOP_OPERACION':
      return {
        ...state,
        isActive: false,
      };
    case 'UPDATE_TIME':
      return {
        ...state,
        simulationTime: action.payload,
      };
    case 'SET_LAST_PLANIFICATION':
      return {
        ...state,
        lastPlanificationTime: action.payload,
      };
    default:
      return state;
  }
};

export const OperacionContext = createContext<OperacionContextType | null>(null);

export const OperacionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(operacionReducer, initialState);

  // Ref para acceso seguro al estado más reciente dentro del intervalo
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (state.isActive) {
      const interval = setInterval(() => {
        const currentSimTime = new Date(stateRef.current.simulationTime.getTime() + stateRef.current.speed * 1000);
        
        // Actualizar tiempo simulado
        dispatch({ type: 'UPDATE_TIME', payload: currentSimTime });

        // Verificar si es hora de planificar
        const lastPlanTime = stateRef.current.lastPlanificationTime;
        if (lastPlanTime) {
          const timeDiffInHours =
            (currentSimTime.getTime() - lastPlanTime.getTime()) / (1000 * 60 * 60);
          
          console.log('Diferencia en horas:', timeDiffInHours);

          if (timeDiffInHours >= 3) {
            planificar(currentSimTime);
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state.isActive]);

  const planificar = async (currentSimTime: Date) => {
    try {
      console.log('Planificando a las:', currentSimTime.toLocaleString());

      const response = await axios.post(
        `${ServicesProperties.BaseUrl}/operacionDia/iniciar/`,
        dataPrueba,
        { headers: ServicesProperties.Headers }
      );

      console.log('Respuesta de planificación:', response.data);

      // Actualiza el tiempo de la última planificación
      dispatch({ type: 'SET_LAST_PLANIFICATION', payload: currentSimTime });
    } catch (error) {
      console.error('Error en planificación:', error);
    }
  };

  const startOperacion = () => {
    const now = new Date();
    dispatch({ type: 'START_OPERACION', payload: { initialTime: now } });
    planificar(now); // Llamada inicial a planificación
  };

  const stopOperacion = () => {
    dispatch({ type: 'STOP_OPERACION' });
  };

  return (
    <OperacionContext.Provider
      value={{
        state,
        startOperacion,
        stopOperacion,
      }}
    >
      {children}
    </OperacionContext.Provider>
  );
};
