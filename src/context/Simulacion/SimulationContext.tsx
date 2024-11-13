// SimulationContext.tsx
import React, { createContext, useReducer, useEffect, useState, useRef } from 'react';
import oficinas from '../../data/oficinas';
import { SimulationAction, SimulationState, Vehicle, Oficina, Pedido, HoraStock } from './simulationTypes';
import { interpolatePosition } from '../../utils/interpolatePosition';
import WebSocketManager from '../../store/webSocketManager';
import { ResponseAlgorithm, OficinaAlgorithmResponse, PedidoAlgorithmResponse } from '../../store/types/ResponseAlgorithm';

export const SimulationContext = createContext<{
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
  vehicles: Vehicle[];
  userId: string;
  solutions: ResponseAlgorithm[];
  offices: Oficina[];
} | null>(null);

const locationCoordinates: Record<string, { lat: number; lng: number }> = oficinas.reduce((acc, oficina) => {
  acc[oficina.ubigeo] = { lat: oficina.latitud, lng: oficina.longitud };
  return acc;
}, {} as Record<string, { lat: number; lng: number }>);

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
    default:
      return state;
  }
}

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(simulationReducer, {
    isPlaying: false,
    vehicles: [],
    speed: 200,
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
    offices: [],
    unplannedOrders: [],
    processedOrderIds: [],
  });

  const [userId, setUserId] = useState<string>('');
  const socketManagerRef = useRef<WebSocketManager | null>(null);
  const [solutions, setSolutions] = useState<ResponseAlgorithm[]>([]);

  useEffect(() => {
    socketManagerRef.current = new WebSocketManager((data) => {
      if (data.userId) {
        setUserId(data.userId);
      } else {
        const newResponse: ResponseAlgorithm = data;
        console.log('Respuesta del algoritmo recibida:', newResponse);
        setSolutions((prevResponses) => [...prevResponses, newResponse]);
      }
    });

    socketManagerRef.current.connect();

    return () => {
      if (socketManagerRef.current) {
        socketManagerRef.current.close();
      }
    };
  }, []);

  const [lastProcessedSolution, setLastProcessedSolution] = useState<string | null>(null);
  const [indexActualProcess, setIndexActualProcess] = useState(0);

  useEffect(() => {
    if (indexActualProcess < solutions.length) {
      const newResponse = solutions[indexActualProcess];

      const newSolutionString = JSON.stringify(newResponse.solucion);

      console.log('Solución a procesar:', newResponse);

      if (newSolutionString !== lastProcessedSolution) {
        setLastProcessedSolution(newSolutionString);

        const newVehicles = convertSolutionToVehicles(newResponse);

        // Procesar oficinas
        const newOffices = convertOffices(newResponse.oficinas);

        // Procesar pedidos no planificados
        const newUnplannedOrders = newResponse.pedidosNoPlanificados || [];

        // Actualizar vehículos
        if (!state.vehicles || state.vehicles.length === 0) {
          dispatch({ type: 'SET_VEHICLES', payload: [...newVehicles] });
          console.log('Primera respuesta:', newVehicles);

          // Actualizar datos de simulación
          dispatch({
            type: 'UPDATE_SIMULATION_DATA',
            payload: {
              totalTrucks: newVehicles.length,
              occupiedOffices: calculateOccupiedOffices(newOffices),
            },
          });
        } else {
          console.log('Procesando');

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
              console.log('Encontró match', existingVehicle.idVehiculo);

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
          console.log('Vehículos actualizados:', updatedVehicles);

          // Actualizar datos de simulación
          dispatch({
            type: 'UPDATE_SIMULATION_DATA',
            payload: {
              totalTrucks: updatedVehicles.length,
              occupiedOffices: calculateOccupiedOffices(newOffices),
            },
          });
        }

        // Actualizar oficinas en el estado
        dispatch({ type: 'SET_OFFICES', payload: newOffices });

        // Actualizar pedidos no planificados en el estado
        dispatch({ type: 'SET_UNPLANNED_ORDERS', payload: newUnplannedOrders });
      } else {
        console.log('Es la misma solución');
      }

      // Actualizar el índice para procesar la siguiente respuesta
      setIndexActualProcess(indexActualProcess + 1);
    }
  }, [indexActualProcess, solutions, lastProcessedSolution, state.vehicles, dispatch]);

  // Función para convertir una solución a vehículos
  const convertSolutionToVehicles = (solution: ResponseAlgorithm): Vehicle[] => {
    const convertedVehicles: Vehicle[] = [];

    if (!solution || !Array.isArray(solution.solucion) || solution.solucion.length === 0) {
      return convertedVehicles;
    }

    const vehicles = solution.solucion.flatMap((item) => {
      if (!item.rutasVehiculos) {
        return [];
      }

      return Object.values(item.rutasVehiculos).flatMap((vehicleItem) => {
        if (!vehicleItem) {
          return [];
        }
        if (!vehicleItem.ruta) {
          return [];
        }

        const firstTramo = vehicleItem.ruta.tramos[0];
        const destinationCode = firstTramo ? firstTramo.destino.codigo : '';
        const locationCoordinate = locationCoordinates[destinationCode] || { lat: 0, lng: 0 };

        // Crear un mapa de destino a fecha de llegada
        const tramoDestinoFechaMap: Record<string, string> = {};
        for (let i = 0; i < vehicleItem.ruta.tramos.length; i++) {
          const tramo = vehicleItem.ruta.tramos[i];
          const fechaLlegada = vehicleItem.ruta.fechasLlegada[i];
          tramoDestinoFechaMap[tramo.destino.codigo] = fechaLlegada;
        }

        // Asignar fechaLlegada a cada pedido
        const pedidos = vehicleItem.ruta.pedidos.map((pedido) => ({
          ...pedido,
          fechaLlegada: tramoDestinoFechaMap[pedido.ubigeoDestino] || null,
        }));

        return {
          idVehiculo: vehicleItem.idVehiculo,
          capacidadCarga: vehicleItem.capacidadCarga,
          fechaLibre: vehicleItem.fechaLibre || null,
          ruta: {
            tramos: vehicleItem.ruta.tramos.map((tramo) => ({
              origen: {
                codigo: tramo.origen.codigo,
                descripcion: tramo.origen.descripcion,
              },
              destino: {
                codigo: tramo.destino.codigo,
                descripcion: tramo.destino.descripcion,
              },
            })),
            pedidos: pedidos,
            fechaInicio: vehicleItem.ruta.fechaInicio,
            fechasSalida: vehicleItem.ruta.fechasSalida,
            fechasLlegada: vehicleItem.ruta.fechasLlegada,
          },
          position: {
            lat: locationCoordinate.lat,
            lng: locationCoordinate.lng,
            progress: 0,
            currentSegmentIndex: -1,
          },
        };
      });
    });

    convertedVehicles.push(...vehicles);
    return convertedVehicles;
  };

  // Función para convertir oficinas
  const convertOffices = (oficinasData: OficinaAlgorithmResponse[]): Oficina[] => {
    return oficinasData.map((oficinaData) => {
      return {
        ubigeo: oficinaData.ubigeo,
        horasStock: oficinaData.horas_stock,
        currentOrders: [],
      };
    });
  };

  // Función para calcular oficinas ocupadas
  const calculateOccupiedOffices = (offices: Oficina[]): number => {
    let occupied = 0;
    offices.forEach((office) => {
      if (office.horasStock.some((horaStock) => horaStock.stock > 0)) {
        occupied += 1;
      }
    });
    return occupied;
  };

  // Función para calcular camiones en movimiento
  const calculateTrucksInMotion = (vehicles: Vehicle[]): number => {
    return vehicles.filter((vehicle) => vehicle.position.currentSegmentIndex !== -1).length;
  };

  // Función para calcular pedidos entregados
  const calculateOrdersDelivered = (vehicles: Vehicle[], currentTime: Date): number => {
    let deliveredOrders = 0;

    vehicles.forEach((vehicle) => {
      const { ruta } = vehicle;
      ruta.pedidos.forEach((pedido) => {
        if (pedido.fechaLlegada) {
          const arrivalTime = new Date(pedido.fechaLlegada);
          if (arrivalTime <= currentTime) {
            deliveredOrders += 1;
          }
        }
      });
    });

    return deliveredOrders;
  };

  // Función para calcular pedidos pendientes
  const calculateOrdersPending = (vehicles: Vehicle[], currentTime: Date): number => {
    let totalOrders = 0;
    let deliveredOrders = 0;

    vehicles.forEach((vehicle) => {
      totalOrders += vehicle.ruta.pedidos.length;
      const { ruta } = vehicle;
      ruta.pedidos.forEach((pedido) => {
        if (pedido.fechaLlegada) {
          const arrivalTime = new Date(pedido.fechaLlegada);
          if (arrivalTime <= currentTime) {
            deliveredOrders += 1;
          }
        }
      });
    });

    return totalOrders - deliveredOrders;
  };

  useEffect(() => {
    if (!state.isPlaying) return;

    const updateInterval = setInterval(() => {
      const newTime = new Date(state.currentTime.getTime() + 1000 * state.speed);

      if (newTime >= state.endTime) {
        dispatch({ type: 'STOP_SIMULATION' });
        clearInterval(updateInterval);
        state.ends = true;
        console.log('Ya pasó la fecha límite');
        return;
      }

      dispatch({ type: 'SET_CURRENT_TIME', payload: newTime });

      const updatedVehicles = state.vehicles.map((vehicle) => {
        const { ruta } = vehicle;
        const startTime = new Date(ruta.fechaInicio);
        const endTime = new Date(ruta.fechasLlegada[ruta.fechasLlegada.length - 1]);

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
          const arrivalTime = new Date(pedido.fechaLlegada);
          if (arrivalTime > state.currentTime && arrivalTime <= newTime) {
            if (!state.processedOrderIds.includes(pedido.idPedido)) {
              // Pedido llega a la oficina
              arrivedOrders.push({
                order: pedido,
                arrivalTime: arrivalTime,
                ubigeoDestino: pedido.ubigeoDestino,
              });
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
        const updatedOffice = { ...office, currentOrders: [...office.currentOrders] };

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
          return timeInOffice < fourHoursInMs;
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
    }, 1000 / state.speed);

    return () => clearInterval(updateInterval);
  }, [state.isPlaying,
      state.currentTime,
      state.speed,
      state.endTime,
      state.vehicles, 
      state.offices,
      state.processedOrderIds,
      dispatch]);

  return (
    <SimulationContext.Provider
      value={{ state, dispatch, vehicles: state.vehicles, userId, solutions, offices: state.offices }}
    >
      {children}
    </SimulationContext.Provider>
  );
}
