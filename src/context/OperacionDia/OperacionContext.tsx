import React, { createContext, useReducer, useEffect, useRef, useState } from 'react';
import { OperacionState, OperacionAction, OperacionContextType } from './operacionTypes';
import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { dataPrueba } from '../../data/dataPruebaOp';
import { convertSolutionToVehicles } from '../../utils/convertSolutionToVehicles';
import { locationCoordinates } from '../../utils/locationCoordinates';
import { interpolatePosition } from '../../utils/interpolatePosition';
import { ResponseAlgorithm } from '../../store/types/ResponseAlgorithm';

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

export const OperacionProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [state, dispatch] = useReducer(operacionReducer, initialState);
  const [solutions, setSolutions] = useState<ResponseAlgorithm[]>([]);

  const [lastProcessedSolution, setLastProcessedSolution] = useState<string | null>(null);
  const [indexActualProcess, setIndexActualProcess] = useState(0);

  // Ref para acceso seguro al estado más reciente dentro del intervalo
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    console.log(indexActualProcess, solutions.length);
    if (indexActualProcess < solutions.length) {
      const newResponse = solutions[indexActualProcess];

      const newSolutionString = JSON.stringify(newResponse.solucion);

      if (newSolutionString !== lastProcessedSolution) {
        setLastProcessedSolution(newSolutionString);

        const newVehicles = convertSolutionToVehicles(newResponse);

        // Actualizar vehículos
        if (!state.vehicles || state.vehicles.length === 0) {
          dispatch({ type: 'SET_VEHICLES', payload: [...newVehicles] });
        } else {
          // Fusionar vehículos existentes con los de la nueva solución
          const updatedVehicles = state.vehicles.map((existingVehicle) => {
            const matchingNewVehicle = newVehicles.find((v) => v.idVehiculo === existingVehicle.idVehiculo);

            if (matchingNewVehicle) {
              const newPosition =
                existingVehicle.position.lat === 0
                  ? {
                    lat: matchingNewVehicle.position.lat,
                    lng: matchingNewVehicle.position.lng,
                    progress: 0,
                    currentSegmentIndex: -1,
                  }
                  : existingVehicle.position;
              const newFechaInicio =
                existingVehicle.ruta.fechaInicio === null ? matchingNewVehicle.ruta.fechaInicio : existingVehicle.ruta.fechaInicio;

              return {
                ...existingVehicle,
                position: newPosition,
                capacidadCarga: matchingNewVehicle.capacidadCarga,
                fechaLibre: matchingNewVehicle.fechaLibre,
                ruta: {
                  fechaInicio: newFechaInicio,
                  fechasSalida: [...(existingVehicle.ruta.fechasSalida || []), ...(matchingNewVehicle.ruta.fechasSalida || [])],
                  fechasLlegada: [...(existingVehicle.ruta.fechasLlegada || []), ...(matchingNewVehicle.ruta.fechasLlegada || [])],
                  tramos: [...(existingVehicle.ruta.tramos || []), ...(matchingNewVehicle.ruta.tramos || [])],
                  pedidos: [...(existingVehicle.ruta.pedidos || []), ...(matchingNewVehicle.ruta.pedidos || [])],
                },
              };
            }

            return existingVehicle;
          });

          // Actualizar el estado con la lista combinada de vehículos
          dispatch({ type: 'SET_VEHICLES', payload: [...updatedVehicles] });
        }
      }

      // Actualizar el índice para procesar la siguiente respuesta
      setIndexActualProcess(indexActualProcess + 1);
    }
  }, [state.vehicles, indexActualProcess, lastProcessedSolution, solutions]);

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
  }, [state.isPlaying, state.vehicles]);

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

      const newResponse = response.data;
      console.log('Respuesta del algoritmo recibida:', newResponse);
      setSolutions((prevResponses) => [...prevResponses, newResponse]);

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
