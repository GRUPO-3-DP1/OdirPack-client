import React, { createContext, useReducer, useEffect, useState } from 'react';
import initialVehicles from '../../data/prueba';
import oficinas from '../../data/oficinas';
import { SimulationAction, SimulationState, Vehicle } from './simulationTypes';
import { interpolatePosition } from '../../utils/interpolatePosition';
import WebSocketManager from '../../store/webSocketManager';
import { ResponseAlgorithm } from '../../store/types/ResponseAlgorithm';

export const SimulationContext = createContext<{
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
  vehicles: Vehicle[];
  userId: string;
  solutions: ResponseAlgorithm[];
} | null>(null);

const locationCoordinates: Record<string, { lat: number; lng: number; }> = oficinas.reduce((acc, oficina) => {
  acc[oficina.ubigeo] = { lat: oficina.latitud, lng: oficina.longitud };
  return acc;
}, {} as Record<string, { lat: number; lng: number; }>);

function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'START_SIMULATION':
      return {
        ...state,
        isPlaying: true,
        startTime: action.payload.startTime,
        currentTime: action.payload.startTime,
        endTime: action.payload.endTime,
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
    default:
      return state;
  }
}

export function SimulationProvider({ children }: { children: React.ReactNode; }) {
  const [state, dispatch] = useReducer(simulationReducer, {
    isPlaying: false,
    vehicles: [],
    speed: 900,
    startTime: new Date("2024-10-21T00:00:00Z"),
    currentTime: new Date("2024-10-21T00:00:00Z"),
    endTime: new Date("2024-10-28T00:00:00Z"),
    trucksInMotion: 5,        // Número de camiones en movimiento
    trucksInMaintenance: 1,   // Número de camiones en mantenimiento
    totalTrucks: 6,           // Capacidad total de la flota
    totalOffices: 246,          // Total de oficinas
    occupiedOffices: 200,       // Oficinas ocupadas
    ordersDelivered: 1040,       // Pedidos entregados
    ordersPending: 300,         // Pedidos pendientes
  });

  const [userId, setUserId] = useState<string>('');
  const [socketManager, setSocketManager] = useState<WebSocketManager | null>(null);
  const [solutions, setSolutions] = useState<ResponseAlgorithm[]>([]); // Arreglo para almacenar respuestas

  useEffect(() => {
    const wsManager = new WebSocketManager((data) => {
      if (data.userId) {
        setUserId(data.userId);
      } else {
        const newResponse: ResponseAlgorithm = data;
        setSolutions((prevResponses) => [...prevResponses, newResponse]);
      }
    });
  
    wsManager.connect();
    setSocketManager(wsManager);
    
    // Cleanup para cerrar el WebSocket al desmontar
    return () => {
      wsManager.close();
    };
  }, []);

  const [lastProcessedSolution, setLastProcessedSolution] = useState<string | null>(null);
  const [indexActualProcess, setIndexActualProcess] = useState(0);

  useEffect(() => {
    if (indexActualProcess < solutions.length) {
      const newResponse = solutions[indexActualProcess];

      // Convertir la solución a cadena para comparar
      const newSolutionString = JSON.stringify(newResponse.solucion);

      console.log("Solución a Procesar ", newResponse);
      
      if (newSolutionString !== lastProcessedSolution) {
        setLastProcessedSolution(newSolutionString); // Actualizar la solución procesada

        const newVehicles = convertSolutionToVehicles(newResponse);

        // Si es la primera respuesta y vehicles está vacío
        if (!state.vehicles || state.vehicles.length === 0) {
          dispatch({ type: 'SET_VEHICLES', payload: [...newVehicles] });
          console.log("Primera respuesta: ", newVehicles);
        }else {
          console.log("Procesando");

          // Fusionar vehículos existentes con los de la nueva solución
          const updatedVehicles = state.vehicles.map(existingVehicle => {
            const matchingNewVehicle = newVehicles.find(v => v.idVehiculo === existingVehicle.idVehiculo);
        
            if (matchingNewVehicle) {
              // Determina la posición
              const newPosition = (existingVehicle.position.lat === 0)
              ? {
                  lat: matchingNewVehicle.position.lat,
                  lng: matchingNewVehicle.position.lng,
                  progress: 0,
                  currentSegmentIndex: -1,
                }
              : existingVehicle.position;
              const newFechaInicio = (existingVehicle.ruta.fechaInicio === null)
              ? matchingNewVehicle.ruta.fechaInicio : existingVehicle.ruta.fechaInicio;
              console.log("Encontró match", existingVehicle.idVehiculo);
        
              return {
                position:newPosition,
                capacidadCarga: matchingNewVehicle.capacidadCarga,
                idVehiculo: matchingNewVehicle.idVehiculo,
                fechaLibre: matchingNewVehicle.fechaLibre,
                ruta: { 
                  fechaInicio: newFechaInicio,
                  fechasSalida: [
                    ...(existingVehicle.ruta.fechasSalida || []),
                    ...(matchingNewVehicle.ruta.fechasSalida || []),
                  ],
                  fechasLlegada: [
                    ...(existingVehicle.ruta.fechasLlegada || []),
                    ...(matchingNewVehicle.ruta.fechasLlegada || []),
                  ],
                  tramos: [
                    ...(existingVehicle.ruta.tramos || []),
                    ...(matchingNewVehicle.ruta.tramos || []),
                  ],
                  pedidos: [
                    ...(existingVehicle.ruta.pedidos || []),
                    ...(matchingNewVehicle.ruta.pedidos || []),
                  ],
                },
            };
          }
        
            return existingVehicle;
          });
        
          // Actualizar el estado con la lista combinada de vehículos
          dispatch({ type: 'SET_VEHICLES', payload: [...updatedVehicles] });
          console.log('Vehículos actualizados:', updatedVehicles);
        }
        
      }else{
        console.log("es la misma solu");
      }

      // Actualizar el índice para procesar la siguiente respuesta
      setIndexActualProcess(indexActualProcess + 1);
    }
  }, [setIndexActualProcess, dispatch, dispatchEvent, state.vehicles]);

  // Función para convertir una solución a vehículos
  const convertSolutionToVehicles = (solution: ResponseAlgorithm): Vehicle[] => {
    const convertedVehicles: Vehicle[] = [];

    if (!solution || !Array.isArray(solution.solucion) || solution.solucion.length === 0) {
        return convertedVehicles;
    }

    const vehicles = solution.solucion.flatMap(item => {
        if (!item.rutasVehiculos) { return [];}

        return Object.values(item.rutasVehiculos).flatMap(vehicleItem => {
            if (!vehicleItem) { return [];}
            if (!vehicleItem.ruta) { return [];
            }

            const firstTramo = vehicleItem.ruta.tramos[0];
            const destinationCode = firstTramo ? firstTramo.destino.codigo : '';
            const locationCoordinate = locationCoordinates[destinationCode] || { lat: 0, lng: 0 };

            return {
                idVehiculo: vehicleItem.idVehiculo,
                capacidadCarga: vehicleItem.capacidadCarga,
                fechaLibre: vehicleItem.fechaLibre || null,
                ruta: {
                    tramos: vehicleItem.ruta.tramos.map(tramo => ({
                        origen: {
                            codigo: tramo.origen.codigo,
                            descripcion: tramo.origen.descripcion
                        },
                        destino: {
                            codigo: tramo.destino.codigo,
                            descripcion: tramo.destino.descripcion
                        }
                    })),
                    pedidos: vehicleItem.ruta.pedidos.map(pedido => ({
                        idPedido: pedido.idPedido,
                        ubigeoDestino: pedido.ubigeoDestino,
                        fechaRegistro: pedido.fechaRegistro,
                        cantidad: pedido.cantidad,
                        idCliente: pedido.idCliente
                    })),
                    fechaInicio: vehicleItem.ruta.fechaInicio,
                    fechasSalida: vehicleItem.ruta.fechasSalida,
                    fechasLlegada: vehicleItem.ruta.fechasLlegada
                },
                position: {
                    lat: locationCoordinate.lat,
                    lng: locationCoordinate.lng,
                    progress: 0,
                    currentSegmentIndex: -1,
                }
            };
        });
    });

    convertedVehicles.push(...vehicles);
    return convertedVehicles;
  };

  useEffect(() => {
    if (!state.isPlaying) return;

    const updateInterval = setInterval(() => {
      const newTime = new Date(state.currentTime.getTime() + 1000 * state.speed);

      if (newTime >= state.endTime) {
        dispatch({ type: 'STOP_SIMULATION' });
        clearInterval(updateInterval);
        console.log("Ya paso la fecha Limite");
        return;
      }

      dispatch({ type: 'SET_CURRENT_TIME', payload: newTime });

      const updatedVehicles = state.vehicles.map(vehicle => {
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
            //console.log("PosCalculada en progreso: ");
            //console.log(newPosition);
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

    }, 1000 / state.speed);

    return () => clearInterval(updateInterval);
  }, [state.isPlaying, state.currentTime, state.speed, state.endTime, state.vehicles]);

  
  return (
    <SimulationContext.Provider value={{ state, dispatch, vehicles: initialVehicles, userId , solutions}}>
      {children}
    </SimulationContext.Provider>
  );
}