import React, { createContext, useReducer, useEffect, useRef } from 'react';
import { OperacionState, OperacionAction, OperacionContextType } from './operacionTypes';
import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { dataPrueba } from '../../data/dataPruebaOp';
import { convertSolutionToVehicles } from '../../utils/convertSolutionToVehicles';
import { locationCoordinates } from '../../utils/locationCoordinates';
import { interpolatePosition } from '../../utils/interpolatePosition';

const initialState: OperacionState = {
  //isActive: false,
  speed: 50, // Aquí aumentar velocidad del tiempo simulado
  //simulationTime: new Date(),
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
        isPlaying: true,
        currentTime: action.payload.initialTime,
        lastPlanificationTime: action.payload.initialTime, // Inicializa planificación al iniciar
      };
    case 'STOP_OPERACION':
      return {
        ...state,
        isPlaying: false,
      };
    case 'UPDATE_TIME':
      return {
        ...state,
        currentTime: action.payload,
      };
    case 'SET_LAST_PLANIFICATION':
      return {
        ...state,
        lastPlanificationTime: action.payload,
      };
    case 'UPDATE_VEHICLE_POSITIONS':
      return {
        ...state,
        vehicles: action.payload,
        trucksInMotion: action.payload.filter(v =>
          v.position.currentSegmentIndex !== -1
        ).length
      };
    case 'SET_VEHICLES':
      return {
        ...state,
        vehicles: action.payload
      };
    case 'SET_CURRENT_BLOQUEOS':
      return {
        ...state,
        currentBloqueos: action.payload
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
    if (!state.isPlaying) return;

    const interval = setInterval(() => {
      const currentSimTime = new Date(stateRef.current.currentTime.getTime() + stateRef.current.speed * 1000);
      dispatch({ type: 'UPDATE_TIME', payload: currentSimTime });

      // Verificar si han pasado 3 horas desde la última planificación
      const lastPlanTime = stateRef.current.lastPlanificationTime;
      if (lastPlanTime) {
        const hoursElapsed = (currentSimTime.getTime() - lastPlanTime.getTime()) / (1000 * 60 * 60);
        if (hoursElapsed >= 3) {
          planificar(currentSimTime);
        }
      }

      // Actualizar posiciones de vehículos
      if (state.vehicles.length > 0) {
        const updatedVehicles = state.vehicles.map(vehicle => {
          const { ruta } = vehicle;
          if (!ruta || !ruta.fechaInicio) return vehicle;

          // Encontrar el segmento actual
          const currentSegmentIndex = ruta.fechasSalida.findIndex((fecha, index) => {
            const segmentStart = new Date(fecha);
            const segmentEnd = new Date(ruta.fechasLlegada[index]);
            return currentSimTime >= segmentStart && currentSimTime <= segmentEnd;
          });

          if (currentSegmentIndex !== -1) {
            const segmentStart = new Date(ruta.fechasSalida[currentSegmentIndex]);
            const segmentEnd = new Date(ruta.fechasLlegada[currentSegmentIndex]);

            const totalSegmentTime = segmentEnd.getTime() - segmentStart.getTime();
            const currentSegmentTime = currentSimTime.getTime() - segmentStart.getTime();
            const progress = Math.max(0, Math.min(1, currentSegmentTime / totalSegmentTime));

            // Si el vehículo no ha alcanzado el final del segmento, actualizar posición
            if (progress < 1) {
              const startCoords = locationCoordinates[ruta.tramos[currentSegmentIndex].origen.codigo];
              const endCoords = locationCoordinates[ruta.tramos[currentSegmentIndex].destino.codigo];
              const newPosition = interpolatePosition(startCoords, endCoords, progress);
              return {
                ...vehicle,
                currentAveria: false, //Nuevo
                position: {
                  ...newPosition,
                  progress,
                  currentSegmentIndex,
                },
                currentRoute: {
                  origin: {
                    lat: startCoords.lat,
                    lng: startCoords.lng
                  },
                  destination: {
                    lat: endCoords.lat,
                    lng: endCoords.lng
                  }
                },
              };
            }       
          }
          // Si no estamos en un segmento válido, mantener la posición actual del vehículo
          return {
            ...vehicle,
            currentAveria: false, //Nuevo
            position: {
              ...vehicle.position,
              currentSegmentIndex: -1,
            },
            currentRoute: undefined,
          };
        });

        dispatch({ type: 'UPDATE_VEHICLE_POSITIONS', payload: updatedVehicles });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isPlaying]);


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

      console.log("Respuesta de la planificación:", response.data);

      // Procesar la respuesta y actualizar vehículos
      const newVehicles = convertSolutionToVehicles(response.data);
      console.log("Nuevos vehículos:", newVehicles)
      dispatch({ type: 'SET_VEHICLES', payload: newVehicles });

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
