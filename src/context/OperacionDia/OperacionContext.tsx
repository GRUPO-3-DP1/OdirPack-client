import React, { createContext, useReducer, useEffect, useRef } from 'react';
import { OperacionState, OperacionAction, OperacionContextType } from './operacionTypes';
import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { dataPrueba } from '../../data/dataPruebaOp';

const initialState: OperacionState = {
  isActive: false,
  speed: 1, // Aquí aumentar velocidad del tiempo simulado
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

          if (timeDiffInHours >= 3) { //aquí se cambia para indicar cada cuánto se planifica
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

      // Función auxiliar para formatear la fecha en formato ISO pero manteniendo la hora local
      const formatearFechaLocal = (fecha: Date) => {
        const pad = (num: number) => String(num).padStart(2, '0');
        
        return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`;
      };

      // Crear fecha 1 hora antes
      //const fechaInicioPlanificacion = new Date(currentSimTime.getTime() - (60 * 60 * 1000));

      // Crear nuevo objeto con la fecha de simulación 1 hora antes
      const datosPlanificacion = {
        ...dataPrueba,
        fechaInicio: formatearFechaLocal(currentSimTime)
      };
      console.log('datosPlanificacion', datosPlanificacion);

      const response = await axios.post(
        `${ServicesProperties.BaseUrl}/operacionDia/iniciar/`,
        datosPlanificacion,
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
