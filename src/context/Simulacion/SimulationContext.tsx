import React, { createContext, useReducer, useEffect, useState } from 'react';
import initialVehicles from '../../data/prueba';
import oficinas from '../../data/oficinas';
import { SimulationAction, SimulationState, Vehicle } from './simulationTypes';
import { interpolatePosition } from '../../utils/interpolatePosition';
import WebSocketManager from '../../store/webSocketManager';
import { ResponseAlgorithm, SolucionAlgorithmResponse } from '../../store/types/ResponseAlgorithm';

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
    speed: 240,
    startTime: new Date("2024-10-21T00:00:00Z"),
    currentTime: new Date("2024-10-21T00:00:00Z"),
    endTime: new Date("2024-10-28T00:00:00Z"),
  });

  const [userId, setUserId] = useState<string>('');
  const [socketManager, setSocketManager] = useState<WebSocketManager | null>(null);
  const [solutions, setSolutions] = useState<ResponseAlgorithm[]>([]); // Arreglo para almacenar respuestas

  useEffect(() => {
    const wsManager = new WebSocketManager((data) => {
      if (data.userId) {
        setUserId(data.userId);
        console.log('userId recibido del servidor:', data.userId);
      } else {
        const newResponse: ResponseAlgorithm = data; // Asegúrate de que data sea del tipo ResponseAlgorithm
        setSolutions((prevResponses) => [...prevResponses, newResponse]); // Actualiza el estado con la nueva respuesta
        console.log('Respuesta recibida:', newResponse);
        newResponse.solucion.forEach((solucion) => {
          const rutasVehiculos = solucion.rutasVehiculos; // Obtener las rutas de vehículos

          // Itera sobre las claves de rutasVehiculos para acceder dinámicamente a los vehículos
          for (const key in rutasVehiculos) {
              if (rutasVehiculos.hasOwnProperty(key)) {
                  const rutaVehiculo = rutasVehiculos[key]; // Accede al objeto RutaVehiculoAlgorithmResponse
                  // Asegúrate de que el objeto rutaVehiculo tenga la propiedad vehiculo
                  if (rutaVehiculo && rutaVehiculo.idVehiculo) {
                      //console.log('idVehiculo:', rutaVehiculo.idVehiculo); // Imprime el idVehiculo
                  }
              }
          }
      });
      }
    });
  
    wsManager.connect();
    setSocketManager(wsManager);
    
    // Cleanup para cerrar el WebSocket al desmontar
    return () => {
      wsManager.close();
    };
  }, []);
  
  // Segundo useEffect: Convierte soluciones a vehículos cada vez que se actualiza solutions
  useEffect(() => {
    if (solutions.length > 0) { // Asegúrate de que hay soluciones
      const lastResponse = solutions[solutions.length - 1]; // Obtén la última respuesta
      //console.log('Convirtiendo soluciones a vehículos para:', lastResponse);
      
      // Asegúrate de que lastResponse tenga soluciones
      if (lastResponse && Array.isArray(lastResponse.solucion) && lastResponse.solucion.length > 0) {
        //console.log('Soluciones válidas:', lastResponse.solucion);
  
        const convertedVehicles = convertSolutionToVehicles(lastResponse);
        // Si no hay vehículos, establece la primera respuesta del WebSocket
        if (convertedVehicles.length > 0 && currentVehiclesIndex==0) {
          dispatch({ type: 'SET_VEHICLES', payload: convertedVehicles });
          console.log('Vehículos iniciales establecidos:', convertedVehicles);
          setCurrentVehiclesIndex(1);
        }
      }else {
        //console.warn('Última respuesta no contiene soluciones válidas:', lastResponse);
      }
    }
  }, [solutions,setSolutions,setUserId,setSocketManager]); // Solo necesitas incluir solutions aquí


  // Función para convertir una solución a vehículos
  const convertSolutionToVehicles = (solution: ResponseAlgorithm): Vehicle[] => {
    const convertedVehicles: Vehicle[] = [];

    // Asegúrate de que la solución tenga rutas
    if (!solution || !Array.isArray(solution.solucion) || solution.solucion.length === 0) {
        //console.warn('La solución no contiene rutas válidas:', solution);
        return convertedVehicles; // Retorna un array vacío si no es válida
    }

    //console.log('Convirtiendo soluciones a vehículos para:', solution);

    const vehicles = solution.solucion.flatMap(item => {
        if (!item.rutasVehiculos) {
            //console.warn('No hay rutas de vehículos en la solución:', item);
            return []; // Retorna un array vacío si no es válido
        }

        return Object.values(item.rutasVehiculos).flatMap(vehicleItem => {
            // Verificación de que vehicleItem y vehicleItem.vehiculo existan
            if (!vehicleItem) {
                //console.warn('Item no válido o sin vehículo:', vehicleItem);
                return []; // Retorna un array vacío si no es válido
            }

            // Verifica que vehicleItem.ruta y vehicleItem.ruta.tramos sean válidos
            if (!vehicleItem.ruta) {
                //console.warn('Ruta no válida o sin tramos:', vehicleItem.ruta);
                return [];
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
    //console.log('Vehículos convertidos:', convertedVehicles);
    return convertedVehicles;
  };

  const [currentVehiclesIndex, setCurrentVehiclesIndex] = useState(0); // Estado para el índice de soluciones

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

      const allVehiclesCompleted = updatedVehicles.every(vehicle => {
        const { ruta } = vehicle;
    
        // Si ruta es null, consideramos que el vehículo está completo
        if (!ruta) {
            return true;
        }
    
        // Verificamos que la ruta tenga fechasLlegada
        if (!ruta.fechasLlegada || ruta.fechasLlegada.length === 0) {
            return vehicle.position.currentSegmentIndex === -1; // Consideramos completo si no tiene fechas
        }
    
        const endTime = new Date(ruta.fechasLlegada[ruta.fechasLlegada.length - 1]);
        return vehicle.position.currentSegmentIndex === -1 && state.currentTime >= endTime;
      });

      if (allVehiclesCompleted) {
        //console.log("Todos los vehículos han completado sus movimientos y no hay más movimientos que procesar.");
        // Actualizar el índice y cargar el siguiente conjunto de vehículos
        console.log("Numero de soluciones-actual solucion: ",solutions.length,currentVehiclesIndex);
        if (currentVehiclesIndex + 1 <= solutions.length) {
          setCurrentVehiclesIndex(currentVehiclesIndex + 1);
          console.log("Siguiente solucion");
          dispatch({ type: 'SET_VEHICLES', payload: convertSolutionToVehicles(solutions[currentVehiclesIndex + 1]) });
        } else {
          //console.log("No hay más conjuntos de vehículos para procesar.");
        }
      }

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