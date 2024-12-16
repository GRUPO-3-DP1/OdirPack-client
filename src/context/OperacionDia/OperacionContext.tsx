import React, { createContext, useReducer, useEffect } from 'react';
import { OperacionState, OperacionAction, OperacionContextType } from './operacionTypes';
import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { dataPrueba } from "../../data/dataPruebaOp";


const initialState: OperacionState = {
  isPlaying: false,
  isActive: false,
  speed: 18,
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
  lastPlanificationTime: null,
  nextPlanificationTime: null,
  isTestMode: true
};

const operacionReducer = (state: OperacionState, action: OperacionAction): OperacionState => {
  switch (action.type) {
    case 'START_OPERACION':
      return {
        ...state,
        isActive: true,
        isPlaying: true
      };
    case 'STOP_OPERACION':
      return {
        ...state,
        isActive: false,
        isPlaying: false,
        nextPlanificationTime: null
      };
    case 'UPDATE_VEHICLES':
      return {
        ...state,
        vehicles: action.payload
      };
    case 'UPDATE_CURRENT_TIME':
      return {
        ...state,
        currentTime: action.payload
      };
    case 'SET_NEXT_PLANIFICATION':
      return {
        ...state,
        nextPlanificationTime: action.payload
      };
    case 'SET_LAST_PLANIFICATION':
      return {
        ...state,
        lastPlanificationTime: action.payload
      };
    case 'TOGGLE_TEST_MODE':
      return {
        ...state,
        isTestMode: !state.isTestMode
      };
    default:
      return state;
  }
};

export const OperacionContext = createContext<OperacionContextType | null>(null);

export const OperacionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(operacionReducer, initialState);

  const planificar = async () => {
    try {
      console.log('Iniciando planificación:', new Date().toLocaleString());
      
      const response = await axios.post(
        `${ServicesProperties.BaseUrl}/operacionDia/iniciar/`, 
        dataPrueba,
        { headers: ServicesProperties.Headers }
      );
      
      console.log('Respuesta de planificación:', response.data);
      
      if (response.data.vehicles) {
        dispatch({ type: 'UPDATE_VEHICLES', payload: response.data.vehicles });
      }
      
      const now = new Date();
      dispatch({ type: 'SET_LAST_PLANIFICATION', payload: now });
      
      const nextPlanification = new Date();
      if (state.isTestMode) {
        nextPlanification.setMinutes(nextPlanification.getMinutes() + 1);
        console.log('Próxima planificación (modo prueba):', nextPlanification.toLocaleString());
      } else {
        nextPlanification.setHours(nextPlanification.getHours() + 3);
        console.log('Próxima planificación:', nextPlanification.toLocaleString());
      }
      
      dispatch({ type: 'SET_NEXT_PLANIFICATION', payload: nextPlanification });
    } catch (error) {
      console.error('Error en planificación:', error);
    }
  };

  useEffect(() => {
    if (state.isActive) {
      const interval = setInterval(() => {
        const now = new Date();
        dispatch({ type: 'UPDATE_CURRENT_TIME', payload: now });

        if (state.nextPlanificationTime && now >= state.nextPlanificationTime) {
          console.log('Ejecutando planificación programada');
          planificar();
        }
      }, state.isTestMode ? 1000 : 10000);

      return () => clearInterval(interval);
    }
  }, [state.isActive, state.nextPlanificationTime]);

  const startOperacion = async () => {
    console.log('Iniciando operación');
    await planificar();
    dispatch({ type: 'START_OPERACION' });
  };

  const stopOperacion = () => {
    console.log('Deteniendo operación');
    dispatch({ type: 'STOP_OPERACION' });
  };

  const toggleTestMode = () => {
    dispatch({ type: 'TOGGLE_TEST_MODE' });
  };

  return (
    <OperacionContext.Provider value={{ 
      state, 
      startOperacion, 
      stopOperacion,
      toggleTestMode
    }}>
      {children}
    </OperacionContext.Provider>
  );
};