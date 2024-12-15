import React, { createContext, useReducer, useEffect, useState } from 'react';
import { SimulationAction, SimulationState, Vehicle, Oficina } from './simulationTypes';
import { interpolatePosition } from '../../utils/interpolatePosition';
import { ResponseAlgorithm } from '../../store/types/ResponseAlgorithm';
import { convertSolutionToVehicles } from '../../utils/convertSolutionToVehicles';
import { locationCoordinates } from '../../utils/locationCoordinates';
import { useWebSocket } from '../../store/hooks/useWebSocket';
import { Services } from '../../../config';
import oficinas from '../../data/oficinas';
import { convertUnplannedPedidosToOrders } from '../../utils/convertUnplannedPedidosToOrders';
import { convertOffices } from '../../utils/convertOffices';
import { calculateTrucksInMotion } from '../../utils/calculateTrucksInMotion';
import { calculateOrdersDelivered } from '../../utils/calculateOrdersDelivered';
import { calculateOrdersPending } from '../../utils/calculateOrdersPending';
import { extractAllRutas } from '../../utils/extractAllRutas';
import { Order } from './simulationTypes';
import { calculateOccupiedOffices } from '../../utils/calculateOccupiedOffices';
import useBloqueosSimulacion from '../../store/hooks/useBloqueosSimulacion';
import { mapBloqueosAsync } from '../../utils/mapearBloqueosDeArchivos';
import { mapPedidosAsync } from '../../utils/mapearPedidosDeArchivos';
import usePedidosSimulacion from '../../store/hooks/usePedidosSimulacion';
import { nuevaDataPrueba } from '../../data/nuevaDataPrueba';
import { Services as ServicesProperties } from '../../../config';
import axios from 'axios';
import dayjs from 'dayjs';
import { calculateCollapseDate } from '../../utils/calculateCollapseDate';

const timeIncrement = 1000;// Avanzar un segundo de simulación por intervalo

export const SimulationContext = createContext<{
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
  vehicles: Vehicle[];
  userId: string;
  solutions: ResponseAlgorithm[];
  offices: Oficina[];
  isLoading: boolean;
  startSimulation: () => void;
  stopSimulation: () => void;
  updateStartTime: (newTime: Date) => void;
  updateSimulationType: (operationType: 'SEMANAL' | 'COLAPSO') => void;
} | null>(null);

function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'SET_START_TIME':
      return { ...state, startTime: action.payload.startTime, endTime: action.payload.endTime };
    case 'START_SIMULATION':
      return {
        ...state,
        isPlaying: true,
        currentTime: state.startTime,
        ends: false,
        executionStartTime: new Date(), // Se establece la hora de inicio real
        executionEndTime: null          // Se reinicia la hora de fin
      };
    case 'STOP_SIMULATION':
      return {
        ...state,
        isPlaying: false,
        ends: true,
        executionEndTime: new Date()
      };
    case 'SET_COLAPSO':
      return { ...state, colapso: action.payload };
    case 'SET_SPEED':
      return { ...state, speed: action.payload };
    case 'UPDATE_VEHICLE_POSITION':
      return { ...state, vehicles: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_VEHICLES':
      return { ...state, vehicles: action.payload };
    case 'SET_CURRENT_BLOQUEOS':
      return { ...state, currentBloqueos: action.payload };
    case 'SET_PEDIDOS':
      return { ...state, pedidos: action.payload };
    case 'SET_TOTAL_TRUCKS':
      return { ...state, totalTrucks: action.payload };
    case 'SET_OCCUPIED_OFFICES':
      return { ...state, occupiedOffices: action.payload };
    case 'SET_TRUCKS_IN_MOTION':
      return { ...state, trucksInMotion: action.payload };
    case 'SET_ORDERS_DELIVERED':
      return { ...state, ordersDelivered: action.payload };
    case 'SET_ORDERS_PENDING':
      return { ...state, ordersPending: action.payload };
    case 'SET_OFFICES':
      return { ...state, offices: action.payload };
    case 'SET_UNPLANNED_ORDERS':
      return { ...state, unplannedOrders: action.payload };
    case 'SET_PROCESSED_ORDER_IDS':
      return { ...state, processedOrderIds: action.payload };
    case 'ADD_HISTORY_ENTRY':
      return { ...state, simulationHistory: [...state.simulationHistory, action.payload], };
    case 'RESET_SIMULATION':  // Resetea el estado a los valores iniciales
      return { ...initialState };
    case 'SET_EXECUTION_START_TIME':
      return { ...state, executionStartTime: action.payload };
    case 'SET_EXECUTION_END_TIME':
      return { ...state, executionEndTime: action.payload };
    case 'SET_SIMULATION_TYPE':
      return { ...state, operationType: action.payload };
    default:
      return state;
  }
}

const initialOffices = oficinas.map((office) => ({
  ...office,
  currentOrders: [],
}));

const initialState: SimulationState = {
  isPlaying: false,
  //
  speed: 9, //9: 1min = 1hora
  startTime: new Date('2024-10-01T00:00:00'),
  currentTime: new Date('2024-10-01T00:00:00'),
  endTime: new Date('2024-10-08T00:00:00'),
  ends: false,
  colapso: null,
  //
  currentBloqueos: [],
  vehicles: [],
  offices: initialOffices,
  pedidos: [],
  unplannedOrders: [],
  processedOrderIds: [],
  //
  trucksInMotion: 0,
  trucksInMaintenance: 0,
  totalTrucks: 0,
  totalOffices: oficinas.length,
  occupiedOffices: 0,
  ordersDelivered: 0,
  ordersPending: 0,
  //
  operationType: 'SEMANAL',
  simulationHistory: [],
  executionStartTime: null,
  executionEndTime: null,
};

export function SimulationProvider({ children }: { children: React.ReactNode; }) {
  const [state, dispatch] = useReducer(simulationReducer, initialState);
  const [finalDataExtracted, setFinalDataExtracted] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [solutions, setSolutions] = useState<ResponseAlgorithm[]>([]);

  const [lastProcessedSolution, setLastProcessedSolution] = useState<string | null>(null);
  const [indexActualProcess, setIndexActualProcess] = useState(0);

  const { bloqueosSimulacion, fetchBloqueosSimulacion } = useBloqueosSimulacion();
  const { pedidosSimulacion, fetchPedidosSimulacion } = usePedidosSimulacion();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  //const { isConnected, closeWebSocket, reconnect } = useWebSocket({
  const { isConnected, closeWebSocket } = useWebSocket({
    url: `${Services.WebUrl}/conexion-websocket`,
    onMessage: (data) => {
      if (state.ends) return;
      if (data.userId) {
        setUserId(data.userId);
      } else {
        const newResponse = data;
        console.log('Respuesta del algoritmo recibida:', newResponse);
        setSolutions((prevResponses) => [...prevResponses, newResponse]);
      }
    },
    onOpen: () => {
      console.log('Conexión WebSocket establecida en SimulationProvider');
    },
    onClose: () => {
      console.log('Conexión WebSocket cerrada en SimulationProvider');
    },
  });

  useEffect(() => {
    fetchBloqueosSimulacion();
    fetchPedidosSimulacion();
  }, [fetchBloqueosSimulacion, fetchPedidosSimulacion]);

  useEffect(() => {
    if (indexActualProcess < solutions.length) {
      const newResponse = solutions[indexActualProcess];
      console.log('MENSAJE: Procesando respuesta del algoritmo:', newResponse);
      if (newResponse.yaNoPlanificar && newResponse.pedidosNoPlanificados.length > 0) {
        const collapseDate = calculateCollapseDate(solutions, state.startTime);

        dispatch({
          type: 'SET_COLAPSO', payload: {
            willCollapse: true,
            collapseDate: collapseDate
          }
        });

        console.log('Se detectó colapso. Fecha calculada:', collapseDate);
      }

      const newSolutionString = JSON.stringify(newResponse.solucion);

      if (newSolutionString !== lastProcessedSolution) {
        setLastProcessedSolution(newSolutionString);

        const newVehicles = convertSolutionToVehicles(newResponse);
        /*console.log("Pedidos replanificados:", newVehicles.map(v => 
          v.ruta.pedidos.filter(p => p.isReplanificado)
        ));*/

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
          //console.log('Vehículos actualizados:', state.vehicles);

          // Actualizar datos de simulación
          // Actualizar 'totalTrucks'
          dispatch({ type: 'SET_TOTAL_TRUCKS', payload: newVehicles.length });
          // Actualizar 'occupiedOffices'
          dispatch({ type: 'SET_OCCUPIED_OFFICES', payload: calculateOccupiedOffices(newOffices) });

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

          // Actualizar 'totalTrucks'
          dispatch({ type: 'SET_TOTAL_TRUCKS', payload: updatedVehicles.length });
          // Actualizar 'occupiedOffices'
          dispatch({ type: 'SET_OCCUPIED_OFFICES', payload: calculateOccupiedOffices(newOffices) });
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
  }, [state.vehicles, indexActualProcess, lastProcessedSolution, solutions, state.startTime]);

  useEffect(() => { //comentario para María: Aquí esta habría que verificar la condicional
    if (state.ends && !solutions.length && !finalDataExtracted) {
      console.log("Extrayendo data final SE EJECUTO");
      closeWebSocket();
      const { pedidos, camiones } = extractAllRutas(state.vehicles);
      dispatch({
        type: 'ADD_HISTORY_ENTRY',
        payload: {
          timestamp: state.currentTime,
          pedidos,
          camiones
        }
      });
      setFinalDataExtracted(true);
    }
  }, [state.ends]);

  useEffect(() => {
    if (!state.isPlaying) return;

    const updateInterval = setInterval(() => {
      const newTime = new Date(state.currentTime.getTime() + timeIncrement * state.speed);

      if (newTime >= state.endTime) {
        clearInterval(updateInterval);
        dispatch({ type: 'STOP_SIMULATION' });
        //dispatch({ type: 'RESET_SIMULATION' });
        //console.log('Ya pasó la fecha límite');
        if (state.colapso) {
          alert('Colapso');
        }
        return;
      }

      dispatch({ type: 'SET_CURRENT_TIME', payload: newTime });

      const updatedVehicles = state.vehicles.map((vehicle) => {
        const { ruta } = vehicle;
        const startTime = new Date(ruta.fechaInicio);
        const endTime = new Date(ruta.fechasLlegada[ruta.fechasLlegada.length - 1]);

        // Detectar si el vehículo ha llegado a una oficina
        const arrivalTimes = ruta.fechasLlegada.map((fecha) => new Date(fecha));
        for (let i = 0; i < arrivalTimes.length; i++) {
          const arrivalTime = arrivalTimes[i];
          const departureTime = new Date(ruta.fechasSalida[i + 1] || ruta.fechasLlegada[i]);

          // Verificar si el vehículo tiene una avería
          if (vehicle.averia?.isAveria) {
            // El vehículo tiene una avería y está en mantenimiento
            const maintenanceStartTime = new Date(vehicle.averia.fechaRegistro);
            const maintenanceEndTime = new Date(vehicle.averia.fechaReparacion); // 1 hora en milisegundos

            // Si el tiempo actual está dentro del periodo de mantenimiento
            if (newTime >= maintenanceStartTime && newTime < maintenanceEndTime) {
              const finishStopTime = new Date(maintenanceStartTime.getTime() + 5 * 60 * 60 * 1000); // 5 horas en milisegundos

              //Entra en averia
              switch (vehicle.averia.tipo) {
                case 'MODERADA':
                  break;
                case 'FUERTE':
                  // Lógica para avería fuerte
                  if (newTime > finishStopTime) {
                    return {
                      ...vehicle,
                      currentAveria: true,
                      maintenance: {
                        inMaintenance: true,
                        startTime: maintenanceStartTime,
                        duration: maintenanceEndTime.getTime() - maintenanceStartTime.getTime(),
                        officeUbigeo: vehicle.averia.almacenAsignado,
                      },
                      position: {
                        ...vehicle.position,
                        currentSegmentIndex: -1,
                      }
                    };
                  } else {
                    return {
                      ...vehicle,
                      currentAveria: true,
                      maintenance: {
                        inMaintenance: true,
                        startTime: maintenanceStartTime,
                        duration: maintenanceEndTime.getTime() - maintenanceStartTime.getTime(),
                        officeUbigeo: vehicle.averia.almacenAsignado,
                      },
                      position: {
                        ...vehicle.position,
                      }
                    };
                  }
                case 'SINIESTRO':
                  // Lógica para siniestro
                  if (newTime > finishStopTime) {
                    return {
                      ...vehicle,
                      maintenance: {
                        inMaintenance: true,
                        startTime: maintenanceStartTime,
                        duration: maintenanceEndTime.getTime() - maintenanceStartTime.getTime(),
                        officeUbigeo: vehicle.averia.almacenAsignado,
                      },
                      currentAveria: true,
                      position: {
                        ...vehicle.position,
                        currentSegmentIndex: -1,
                      }
                    };
                  } else {
                    return {
                      ...vehicle,
                      currentAveria: true,
                      maintenance: {
                        inMaintenance: true,
                        startTime: maintenanceStartTime,
                        duration: maintenanceEndTime.getTime() - maintenanceStartTime.getTime(),
                        officeUbigeo: vehicle.averia.almacenAsignado,
                      },
                      position: {
                        ...vehicle.position,
                      }
                    };
                  }
              }

              return {
                ...vehicle,
                maintenance: {
                  inMaintenance: true,
                  startTime: maintenanceStartTime,
                  duration: maintenanceEndTime.getTime() - maintenanceStartTime.getTime(),
                  officeUbigeo: vehicle.averia.almacenAsignado,
                },
                currentAveria: true,
                position: {
                  ...vehicle.position,
                },
              };
            }
          } else {
            // Si el vehículo no tiene avería, proceder con la lógica de oficina como antes
            if (newTime >= arrivalTime && newTime < departureTime) {
              const maintenanceStartTime = arrivalTime;
              const maintenanceDuration = 60 * 60 * 1000; // 1 hora en milisegundos
              const maintenanceEndTime = new Date(maintenanceStartTime.getTime() + maintenanceDuration);

              // Si el tiempo actual está dentro del periodo de mantenimiento en oficina
              if (newTime >= maintenanceStartTime && newTime < maintenanceEndTime) {
                return {
                  ...vehicle,
                  maintenance: {
                    inMaintenance: true,
                    startTime: maintenanceStartTime,
                    duration: maintenanceDuration,
                    officeUbigeo: ruta.tramos[i].destino.codigo,
                  },
                  currentAveria: false,
                  position: {
                    ...vehicle.position,
                    currentSegmentIndex: -1,
                  },
                };
              }
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
          const fourHoursInMs = 1 * 60 * 60 * 1000;
          return timeInOffice <= fourHoursInMs;
        });

        return updatedOffice;
      });

      //Actualizar bloqueos actuales
      // const updatedBloqueos = state.currentBloqueos.filter((bloqueo) => {
      //   const bloqueoEndTime = new Date(bloqueo.fechaFin);
      //   return bloqueoEndTime > newTime;
      // });

      // dispatch({ type: 'SET_CURRENT_BLOQUEOS', payload: updatedBloqueos });
      // Actualizar oficinas y processedOrderIds en el estado
      dispatch({ type: 'SET_OFFICES', payload: updatedOffices });
      dispatch({ type: 'SET_PROCESSED_ORDER_IDS', payload: newProcessedOrderIds });
      // Actualizar 'trucksInMotion'
      dispatch({ type: 'SET_TRUCKS_IN_MOTION', payload: calculateTrucksInMotion(updatedVehicles) });
      // Actualizar 'ordersDelivered'
      dispatch({ type: 'SET_ORDERS_DELIVERED', payload: calculateOrdersDelivered(updatedVehicles, newTime) });
      // Actualizar 'ordersPending'
      dispatch({ type: 'SET_ORDERS_PENDING', payload: calculateOrdersPending(updatedVehicles, newTime) });
      // Luego de actualizar vehículos, etc, extraer data actual
      // if (solutions.length > 0) {
      //   const { pedidos, camiones } = extractAllRutas(solutions); 
      //   dispatch({
      //     type: 'ADD_HISTORY_ENTRY',
      //     payload: {
      //       timestamp: newTime,
      //       pedidos,
      //       camiones
      //     }
      //   });
      // }
    }, timeIncrement / state.speed);

    return () => clearInterval(updateInterval);
  }, [
    state.isPlaying,
    state.currentTime,
    state.speed,
    state.endTime,
    state.vehicles,
  ]);

  const startSimulation = async () => {
    try {
      if (state.startTime && state.operationType) {

        setIsLoading(true);

        const [mappedPedidos, mappedBloqueos] = await Promise.all([
          mapPedidosAsync(
            pedidosSimulacion,
            state.startTime,
            state.endTime
          ),
          mapBloqueosAsync(
            bloqueosSimulacion,
            state.startTime,
            state.endTime
          )
        ]);

        console.log('Bloqueos mapeados:', mappedBloqueos);
        console.log('Pedidos mapeados:', mappedPedidos);

        const dataPrueba = {
          ...nuevaDataPrueba,
          pedidos: mappedPedidos,
          bloqueos: mappedBloqueos,
          fechaInicio: dayjs(state.startTime).format('YYYY-MM-DDTHH:mm:ss'),
        };

        const response = await axios.post(
          `${ServicesProperties.BaseUrl}/simulacion/iniciar?userId=${userId}`, dataPrueba,
          { headers: ServicesProperties.Headers }
        );
        console.log('Simulación iniciada, respuesta del servidor:', response.data);

        dispatch({ type: 'START_SIMULATION' });
      }
    } catch (error) {
      console.error('Error al iniciar la simulación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopSimulation = () => {
    dispatch({ type: 'RESET_SIMULATION' });
    setSolutions([]);
    setIndexActualProcess(0);
    setLastProcessedSolution(null);

    if (isConnected) {
      closeWebSocket();
    }
  };

  const updateStartTime = (newTime: Date) => {
    switch (state.operationType) {
      case 'SEMANAL':
        {
          const weeklyEndTime = new Date(newTime);
          weeklyEndTime.setDate(weeklyEndTime.getDate() + 7); // Add 7 days for weekly operation
          dispatch({
            type: 'SET_START_TIME',
            payload: { startTime: newTime, endTime: weeklyEndTime },
          });
          break;
        }
      case 'COLAPSO':
        {
          const collapseEndTime = new Date(newTime);
          collapseEndTime.setDate(collapseEndTime.getDate() + 60); // Add 360 days for collapse operation
          dispatch({
            type: 'SET_START_TIME',
            payload: { startTime: newTime, endTime: collapseEndTime },
          });
          break;
        }
    }
  };

  const updateSimulationType = (operationType: 'SEMANAL' | 'COLAPSO') => {
    dispatch({
      type: 'SET_SIMULATION_TYPE',
      payload: operationType,
    });

    const newEndTime = new Date(state.startTime);
    if (operationType === 'SEMANAL') {
      newEndTime.setDate(newEndTime.getDate() + 7); // Add 7 days for weekly operation
    } else if (operationType === 'COLAPSO') {
      newEndTime.setDate(newEndTime.getDate() + 60); // Add 360 days for collapse operation
    }

    dispatch({
      type: 'SET_START_TIME',
      payload: { startTime: state.startTime, endTime: newEndTime },
    });
  };

  return (
    <SimulationContext.Provider
      value={{ state, dispatch, vehicles: state.vehicles, userId, solutions, offices: state.offices, isLoading, startSimulation, stopSimulation, updateStartTime, updateSimulationType }}
    >
      {children}
    </SimulationContext.Provider>
  );
}
