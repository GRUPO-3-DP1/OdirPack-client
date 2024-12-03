import React, { createContext, useReducer, useEffect, useState } from 'react';
import oficinas from '../../data/oficinas';
import { SimulationAction, SimulationState, Vehicle, Oficina, Order } from './simulationTypes';
import { interpolatePosition } from '../../utils/interpolatePosition';
import { ResponseAlgorithm } from '../../store/types/ResponseAlgorithm';
import { convertUnplannedPedidosToOrders } from '../../utils/convertUnplannedPedidosToOrders';
import { convertSolutionToVehicles } from '../../utils/convertSolutionToVehicles';
import { convertOffices } from '../../utils/convertOffices';
import { locationCoordinates } from '../../utils/locationCoordinates';
import { calculateTrucksInMotion } from '../../utils/calculateTrucksInMotion';
import { calculateOrdersDelivered } from '../../utils/calculateOrdersDelivered';
import { calculateOrdersPending } from '../../utils/calculateOrdersPending';
import { useWebSocket } from '../../store/hooks/useWebSocket';
import { Services } from '../../../config';

export const SimulationContext = createContext<{
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
  vehicles: Vehicle[];
  userId: string;
  solutions: ResponseAlgorithm[];
  offices: Oficina[];
  stopSimulation: () => void;
} | null>(null);

function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'START_SIMULATION':
      return {
        ...state,
        isPlaying: true,
        startTime: action.payload.startTime,
        currentTime: action.payload.startTime,
        endTime: action.payload.endTime,
        ends: false,
      };
    case 'STOP_SIMULATION':
      return { ...state, isPlaying: false };
    case 'SET_SPEED':
      return { ...state, speed: action.payload };
    case 'UPDATE_VEHICLE_POSITION':
      return { ...state, vehicles: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_VEHICLES':
      return { ...state, vehicles: action.payload };
    case 'UPDATE_SIMULATION_DATA':
      return { ...state, ...action.payload };
    case 'SET_OFFICES':
      return { ...state, offices: action.payload };
    case 'SET_UNPLANNED_ORDERS':
      return { ...state, unplannedOrders: action.payload };
    case 'SET_PROCESSED_ORDER_IDS':
      return { ...state, processedOrderIds: action.payload };
    case 'RESET_SIMULATION':  // Resetea el estado a los valores iniciales
      return { ...initialState };
    default:
      return state;
  }
}

const initialOffices = oficinas.map((office) => ({
  ...office,
  currentOrders: [],
}));

const initialState = {
  isPlaying: false,
  vehicles: [],
  speed: 70,
  ends: false,
  startTime: new Date('2024-10-21T00:00:00Z'),
  currentTime: new Date('2024-10-21T00:00:00Z'),
  endTime: new Date('2024-10-28T00:00:00Z'),
  trucksInMotion: 0,
  trucksInMaintenance: 0,
  totalTrucks: 0,
  totalOffices: oficinas.length,
  occupiedOffices: 0,
  ordersDelivered: 0,
  ordersPending: 0,
  offices: initialOffices,
  unplannedOrders: [],
  processedOrderIds: [],
};

export function SimulationProvider({ children }: { children: React.ReactNode; }) {
  const [state, dispatch] = useReducer(simulationReducer, initialState);

  const [userId, setUserId] = useState<string>('');
  const [solutions, setSolutions] = useState<ResponseAlgorithm[]>([]);

  const { isConnected, closeWebSocket } = useWebSocket({
    url: `${Services.WebUrl}/conexion-websocket`,
    onMessage: (data) => {
      if (data.userId) {
        setUserId(data.userId);
      } else {
        const newResponse = data;
        //console.log('Respuesta del algoritmo recibida:', newResponse);
        setSolutions((prevResponses) => [...prevResponses, newResponse]);
      }
    },
    onOpen: () => {
      //console.log('Conexión WebSocket establecida en SimulationProvider');
    },
    onClose: () => {
      //console.log('Conexión WebSocket cerrada en SimulationProvider');
    },
  });

  const [lastProcessedSolution, setLastProcessedSolution] = useState<string | null>(null);
  const [indexActualProcess, setIndexActualProcess] = useState(0);

  useEffect(() => {
    if (indexActualProcess < solutions.length) {
      const newResponse = solutions[indexActualProcess];

      const newSolutionString = JSON.stringify(newResponse.solucion);

      //console.log('Solución a procesar:', newResponse);

      if (newSolutionString !== lastProcessedSolution) {
        setLastProcessedSolution(newSolutionString);

        const newVehicles = convertSolutionToVehicles(newResponse);

        // Procesar oficinas
        const newOffices = convertOffices(newResponse.oficinas);

        // Fusionar oficinas
        const mergedOffices = state.offices.map((office) => {
          const updatedOffice = newOffices.find((o) => o.ubigeo === office.ubigeo);
          if (updatedOffice) {
            return {
              ...office,
              ...updatedOffice,
            };
          }
          return office;
        });

        dispatch({ type: 'SET_OFFICES', payload: mergedOffices });

        // Procesar pedidos no planificados
        const newUnplannedOrders = newResponse.pedidosNoPlanificados || [];

        // Convertir pedidos no planificados a Order[]
        const unplannedOrders: Order[] = convertUnplannedPedidosToOrders(newUnplannedOrders);

        // Actualizar vehículos
        if (!state.vehicles || state.vehicles.length === 0) {
          dispatch({ type: 'SET_VEHICLES', payload: [...newVehicles] });
          //console.log('Primera respuesta:', newVehicles);

          // Actualizar datos de simulación
          
        } else {
          //console.log('Procesando');

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
              //console.log('Encontró match', existingVehicle.idVehiculo);

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
          //console.log('Vehículos actualizados:', updatedVehicles);

      
        }

        // Actualizar oficinas en el estado
        dispatch({ type: 'SET_OFFICES', payload: newOffices });

        // Actualizar pedidos no planificados en el estado
        dispatch({ type: 'SET_UNPLANNED_ORDERS', payload: unplannedOrders });
      } else {
        //console.log('Es la misma solución');
      }

      // Actualizar el índice para procesar la siguiente respuesta
      setIndexActualProcess(indexActualProcess + 1);
    }
  }, [indexActualProcess, solutions, lastProcessedSolution, state.vehicles, dispatch, state.offices]);

  // Función para calcular oficinas ocupadas


  const timeIncrement = 1000;// Avanzar un segundo de simulación por intervalo

  useEffect(() => {
    if (!state.isPlaying) return;

    const updateInterval = setInterval(() => {
      const newTime = new Date(state.currentTime.getTime() + timeIncrement * state.speed);

      if (newTime >= state.endTime) {
        dispatch({ type: 'STOP_SIMULATION' });
        clearInterval(updateInterval);
        state.ends = true;
        //console.log('Ya pasó la fecha límite');
        return;
      }

      dispatch({ type: 'SET_CURRENT_TIME', payload: newTime });

      const updatedVehicles = state.vehicles.map((vehicle) => {
        const { ruta } = vehicle;
        const startTime = new Date(ruta.fechaInicio);
        const endTime = new Date(ruta.fechasLlegada[ruta.fechasLlegada.length - 1]);

        // Verificar si el vehículo está en mantenimiento
        

        // Detectar si el vehículo ha llegado a una oficina
        const arrivalTimes = ruta.fechasLlegada.map((fecha) => new Date(fecha));
        for (let i = 0; i < arrivalTimes.length; i++) {
          const arrivalTime = arrivalTimes[i];
          const departureTime = new Date(ruta.fechasSalida[i + 1] || ruta.fechasLlegada[i]);

          if (newTime >= arrivalTime && newTime < departureTime) {
            // El vehículo ha llegado a una oficina y está en mantenimiento
            const maintenanceStartTime = arrivalTime;
            const maintenanceDuration = 4 * 60 * 60 * 1000; // 4 horas en milisegundos
            const maintenanceEndTime = new Date(maintenanceStartTime.getTime() + maintenanceDuration);

            // Si el tiempo actual está dentro del periodo de mantenimiento
            if (newTime >= maintenanceStartTime && newTime < maintenanceEndTime) {
              return {
                ...vehicle,
                maintenance: {
                  inMaintenance: true,
                  startTime: maintenanceStartTime,
                  duration: maintenanceDuration,
                  officeUbigeo: ruta.tramos[i].destino.codigo,
                },
                position: {
                  ...vehicle.position,
                  currentSegmentIndex: -1,
                },
              };
            }
          }
        }

        // Si la simulación aún no llega al tiempo de inicio del vehículo o ya terminó, devolver la posición actual
        if (newTime < startTime || newTime > endTime) {
          return {
            ...vehicle,
            position: {
              ...vehicle.position,
              currentSegmentIndex: -1,
            },
          };
        }

        // Encontrar el segmento actual
        let currentSegmentIndex = -1;
        for (let i = 0; i < ruta.fechasSalida.length; i++) {
          const segmentStart = new Date(ruta.fechasSalida[i]);
          const segmentEnd = new Date(ruta.fechasLlegada[i]);

          if (newTime >= segmentStart && newTime <= segmentEnd) {
            currentSegmentIndex = i;
            break;
          }
        }

        // Si encontramos un segmento válido
        if (currentSegmentIndex !== -1) {
          const segmentStart = new Date(ruta.fechasSalida[currentSegmentIndex]);
          const segmentEnd = new Date(ruta.fechasLlegada[currentSegmentIndex]);

          const totalSegmentTime = segmentEnd.getTime() - segmentStart.getTime();
          const currentSegmentTime = newTime.getTime() - segmentStart.getTime();
          const progress = Math.max(0, Math.min(1, currentSegmentTime / totalSegmentTime));

          // Si el vehículo no ha alcanzado el final del segmento, actualizar posición
          if (progress < 1) {
            const startCoords = locationCoordinates[ruta.tramos[currentSegmentIndex].origen.codigo];
            const endCoords = locationCoordinates[ruta.tramos[currentSegmentIndex].destino.codigo];
            const newPosition = interpolatePosition(startCoords, endCoords, progress);
            return {
              ...vehicle,
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
          position: {
            ...vehicle.position,
            currentSegmentIndex: -1,
          },
          currentRoute: undefined,
        };
      });

      dispatch({ type: 'UPDATE_VEHICLE_POSITION', payload: updatedVehicles });

      // Procesar llegadas de pedidos
      const arrivedOrders: {
        order: Order;
        arrivalTime: Date;
        ubigeoDestino: string;
      }[] = [];

      state.vehicles.forEach((vehicle) => {
        vehicle.ruta.pedidos.forEach((pedido) => {
          if (pedido.fechaLlegada) {
            const arrivalTime = new Date(pedido.fechaLlegada);
            if (arrivalTime <= newTime && !state.processedOrderIds.includes(pedido.idPedido)) {
              if (!state.processedOrderIds.includes(pedido.idPedido)) {
                // Pedido llega a la oficina
                arrivedOrders.push({
                  order: pedido,
                  arrivalTime: arrivalTime,
                  ubigeoDestino: pedido.ubigeoDestino,
                });
              }
            }
          }
        });
      });

      // Actualizar processedOrderIds
      const newProcessedOrderIds = [...state.processedOrderIds];
      arrivedOrders.forEach((arrivedOrder) => {
        newProcessedOrderIds.push(arrivedOrder.order.idPedido);
      });

      // Procesar salidas de pedidos
      const updatedOffices = state.offices.map((office) => {

        const updatedOffice = { ...office, currentOrders: [...(office.currentOrders ?? [])] };

        // Agregar pedidos que llegan
        arrivedOrders.forEach((arrivedOrder) => {
          if (arrivedOrder.ubigeoDestino === office.ubigeo) {
            updatedOffice.currentOrders.push({
              order: arrivedOrder.order,
              arrivalTime: arrivedOrder.arrivalTime,
            });
          }
        });

        // Remover pedidos que han estado más de 4 horas
        updatedOffice.currentOrders = updatedOffice.currentOrders.filter((currentOrder) => {
          const timeInOffice = newTime.getTime() - currentOrder.arrivalTime.getTime();
          const fourHoursInMs = 4 * 60 * 60 * 1000;
          return timeInOffice <= fourHoursInMs;
        });

        return updatedOffice;
      });

      // Actualizar oficinas y processedOrderIds en el estado
      dispatch({ type: 'SET_OFFICES', payload: updatedOffices });
      dispatch({ type: 'SET_PROCESSED_ORDER_IDS', payload: newProcessedOrderIds });

      // Actualizar datos de simulación
      dispatch({
        type: 'UPDATE_SIMULATION_DATA',
        payload: {
          trucksInMotion: calculateTrucksInMotion(updatedVehicles),
          ordersDelivered: calculateOrdersDelivered(updatedVehicles, newTime),
          ordersPending: calculateOrdersPending(updatedVehicles, newTime),
        },
      });
    }, timeIncrement / state.speed);

    return () => clearInterval(updateInterval);
  }, [
    state.isPlaying,
    state.currentTime,
    state.speed,
    state.endTime,
    state.vehicles,
    state.offices,
    state.processedOrderIds,
    dispatch,
    state,
  ]);

  const stopSimulation = () => {
    dispatch({ type: 'STOP_SIMULATION' });
    dispatch({ type: 'RESET_SIMULATION' });
    setLastProcessedSolution(null);
    setIndexActualProcess(0);
    if (isConnected) {
      closeWebSocket();
    }
  };

  return (
    <SimulationContext.Provider
      value={{ state, dispatch, vehicles: state.vehicles, userId, solutions, offices: state.offices, stopSimulation }}
    >
      {children}
    </SimulationContext.Provider>
  );
}