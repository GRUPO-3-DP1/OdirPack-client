import React, { createContext, useReducer, useEffect } from 'react';
import initialVehicles from '../../data/prueba';
import oficinas from '../../data/oficinas';

// Tipos
interface Location {
  codigo: string;
  descripcion: string;
}

interface RouteSegment {
  origen: Location;
  destino: Location;
}

interface Order {
  idPedido: string;
  ubigeoDestino: string;
  fechaRegistro: string;
  cantidad: number;
  idCliente: string;
}

interface Route {
  tramos: RouteSegment[];
  pedidos: Order[];
  fechaInicio: string;
  fechasSalida: string[];
  fechasLlegada: string[];
}

interface Vehicle {
  idVehiculo: string;
  capacidadCarga: number;
  fechaLibre: string;
  ruta: Route;
}

interface VehiclePosition {
  lat: number;
  lng: number;
  progress: number;
  currentSegmentIndex: number;
}

interface SimulationState {
  isPlaying: boolean;
  vehicles: Map<string, VehiclePosition>;
  speed: number; // Factor de velocidad (1 = tiempo real, 10 = 10x más rápido)
  currentTime: Date;
}

type SimulationAction =
  | { type: 'START_SIMULATION'; }
  | { type: 'STOP_SIMULATION'; }
  | { type: 'SET_SPEED'; payload: number; }
  | { type: 'UPDATE_VEHICLE_POSITION'; payload: { vehicleId: string; position: VehiclePosition; }; }
  | { type: 'SET_CURRENT_TIME'; payload: Date; };

// Contexto
export const SimulationContext = createContext<{
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
  vehicles: Vehicle[];
} | null>(null);

// Coordenadas ficticias para las ubicaciones (en un caso real se obtendrían de una API)
// Mapa de coordenadas de las oficinas
const locationCoordinates: Record<string, { lat: number; lng: number; }> = oficinas.reduce((acc, oficina) => {
  acc[oficina.ubigeo] = { lat: oficina.latitud, lng: oficina.longitud };
  return acc;
}, {} as Record<string, { lat: number; lng: number; }>);

// Reducer
function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'START_SIMULATION':
      return { ...state, isPlaying: true };
    case 'STOP_SIMULATION':
      return { ...state, isPlaying: false };
    case 'SET_SPEED':
      return { ...state, speed: action.payload };
    case 'UPDATE_VEHICLE_POSITION': {
      const newVehicles = new Map(state.vehicles);
      newVehicles.set(action.payload.vehicleId, action.payload.position);
      return { ...state, vehicles: newVehicles };
    }
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    default:
      return state;
  }
}

// Función helper para convertir grados a radianes
function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

// Función mejorada para calcular posición interpolada usando la fórmula Haversine
function interpolatePosition(start: { lat: number; lng: number; }, end: { lat: number; lng: number; }, progress: number) {
  const R = 6371; // Radio de la Tierra en kilómetros

  const lat1 = toRad(start.lat);
  const lon1 = toRad(start.lng);
  const lat2 = toRad(end.lat);
  const lon2 = toRad(end.lng);

  const d = 2 * R * Math.asin(
    Math.sqrt(
      Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon2 - lon1) / 2), 2)
    )
  );

  const A = Math.sin((1 - progress) * d / R) / Math.sin(d / R);
  const B = Math.sin(progress * d / R) / Math.sin(d / R);

  const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
  const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
  const z = A * Math.sin(lat1) + B * Math.sin(lat2);

  const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lon = Math.atan2(y, x);

  return {
    lat: lat * 180 / Math.PI,
    lng: lon * 180 / Math.PI
  };
}

// Provider
export function SimulationProvider({ children }: { children: React.ReactNode; }) {
  const [state, dispatch] = useReducer(simulationReducer, {
    isPlaying: false,
    vehicles: new Map(),
    speed: 60,
    currentTime: new Date(initialVehicles[0].ruta.fechaInicio),
  });

  useEffect(() => {
    if (!state.isPlaying) return;

    const updateInterval = setInterval(() => {
      const newTime = new Date(state.currentTime.getTime() + 1000 * state.speed);
      dispatch({ type: 'SET_CURRENT_TIME', payload: newTime });

      initialVehicles.forEach(vehicle => {
        const { ruta } = vehicle;
        const startTime = new Date(ruta.fechaInicio);
        const endTime = new Date(ruta.fechasLlegada[ruta.fechasLlegada.length - 1]);

        if (newTime >= startTime && newTime <= endTime) {
          // Encontrar el segmento actual con mayor precisión
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

            // Calcular progreso con mayor precisión
            const totalSegmentTime = segmentEnd.getTime() - segmentStart.getTime();
            const currentSegmentTime = newTime.getTime() - segmentStart.getTime();
            const progress = Math.max(0, Math.min(1, currentSegmentTime / totalSegmentTime));

            const startCoords = locationCoordinates[ruta.tramos[currentSegmentIndex].origen.codigo];
            const endCoords = locationCoordinates[ruta.tramos[currentSegmentIndex].destino.codigo];

            // Usar la función de interpolación mejorada
            const position = interpolatePosition(startCoords, endCoords, progress);

            dispatch({
              type: 'UPDATE_VEHICLE_POSITION',
              payload: {
                vehicleId: vehicle.idVehiculo,
                position: {
                  ...position,
                  progress,
                  currentSegmentIndex,
                },
              },
            });
          }
        }

        // Detener la simulación cuando todos los vehículos hayan llegado a su destino
        if (newTime >= endTime) {
          dispatch({ type: 'STOP_SIMULATION' });
        }
      });
    }, 1000 / state.speed);

    return () => clearInterval(updateInterval);
  }, [state.isPlaying, state.currentTime, state.speed]);

  return (
    <SimulationContext.Provider value={{ state, dispatch, vehicles: initialVehicles }}>
      {children}
    </SimulationContext.Provider>
  );
}