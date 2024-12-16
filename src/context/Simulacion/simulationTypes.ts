import { VehiculoAveriadoAlgorithmResponse } from "../../store/types/ResponseAlgorithm";
import { PedidoSimulacion } from "../../utils/mapearPedidosDeArchivos";

//simulationTypes.ts
type Location = {
  codigo: string;
  descripcion: string;
};

type RouteSegment = {
  origen: Location;
  destino: Location;
};

export type Order = {
  idPedido: string;
  ubigeoDestino: string;
  ubigeoOrigen: string | null; //nuevo
  fechaRegistro: string;
  cantidad: number;
  idCliente: string;
  fechaLlegada: string | null;
  fechaRecogida: string | null;
  fechaSalida: string | null;
  isReplanificado: boolean;
};

type Route = {
  tramos: RouteSegment[];
  pedidos: Order[];
  fechaInicio: string;
  fechasSalida: string[];
  fechasLlegada: string[];
};

export type VehiclePosition = {
  lat: number;
  lng: number;
  progress: number;
  currentSegmentIndex: number;
};

export type Vehicle = {
  idVehiculo: string;
  almacenOrigen: string;
  capacidadCarga: number;
  fechaLibre: string | null;
  ruta: Route;
  position: VehiclePosition;
  currentRoute?: {
    origin: {
      lat: number;
      lng: number;
    };
    destination: {
      lat: number;
      lng: number;
    };
  };
  maintenance?: {
    inMaintenance: boolean;
    startTime: Date;
    duration: number; // Duración del mantenimiento en milisegundos
    officeUbigeo: string; // Ubigeo de la oficina donde está en mantenimiento
  };
  currentAveria?: boolean;
  averia?: {
    isAveria: boolean;
    tipo: string;
    fechaRegistro: string;
    ubiInicio: string;
    ubiFin: string;
    fechaReparacion: string;
    cargaReplanificada: boolean;
    almacenAsignado: string;
  };
};

export type Bloqueo = {
  idBloqueo: string;
  origen: { lat: number; lng: number; };
  destino: { lat: number; lng: number; };
  fechaInicio: Date;
  fechaFin: Date;
};

interface ColapsoInfo {
  willCollapse: boolean;
  collapseDate: Date | null;
}

export type SimulationState = {
  isPlaying: boolean;
  //
  speed: number;
  startTime: Date;
  currentTime: Date;
  endTime: Date;
  ends: boolean;
  colapso: ColapsoInfo | null;
  //
  currentBloqueos: Bloqueo[];
  vehicles: Vehicle[];
  offices: Oficina[];
  pedidos: PedidoSimulacion[];
  unplannedOrders: Order[];      // Añadir pedidos no planificados
  processedOrderIds: string[];
  vehiculosAveriados: VehiculoAveriadoAlgorithmResponse[];
  //
  trucksInMotion: number;        // Número de camiones en movimiento
  trucksInMaintenance: number;   // Número de camiones en mantenimiento
  totalTrucks: number;           // Capacidad total de la flota
  totalOffices: number;          // Total de oficinas
  occupiedOffices: number;       // Oficinas ocupadas
  ordersDelivered: number;       // Pedidos entregados
  ordersPending: number;         // Pedidos pendientes
  //
  operationType: 'SEMANAL' | 'COLAPSO';
  simulationHistory: {
    timestamp: Date;
    pedidos: OrderRow[];
    camiones: TruckRow[];
  }[];
  executionStartTime?: Date | null;
  executionEndTime?: Date | null;
};

export type HoraStock = {
  hora: string;
  stock: number;
};

export type Oficina = {
  ubigeo: string;
  departamento: string;
  provincia: string;
  latitud: number;
  longitud: number;
  regionNatural: string;
  almacen: number;
  isAlmacen?: boolean;
  horasStock?: HoraStock[];
  currentOrders?: {
    order: Order;
    arrivalTime: Date;
  }[];
};

export type Pedido = {
  idPedido: string;
  ubigeoOrigen: string | null;
  ubigeoDestino: string;
  fechaRegistro: string;
  fechaLlegada: string | null;
  fechaPlazoMaximo: string;
  cantidad: number;
  idCliente: string;
  estado: string;
};

export type SectionTruckRow = {
  horaAveria: string;
  inicio: string;
  fin: string;
  origen: string;
  destino: string;
  estado: string;
};

export type TruckRow = {
  id: number;
  ruta: string;
  camion: string;
  inicio: string;
  fin: string;
  origen: string;
  destino: string;
  averia: boolean;
  estado: string; // "Completado", "Averiado", "En tránsito"
  tramosDetalle?: SectionTruckRow[];
};

export type SectionOrderRow = {
  inicio: string;
  fin: string;
  origen: string;
  destino: string;
  estado: string; // "Retrasado", "Entregado", "En tránsito"
  camion?: string;
};

export type OrderRow = {
  id: number;
  ruta: string;
  pedido: string;
  inicio: string;
  fin: string;
  origen: string;
  destino: string;
  paquetes: number;
  estado: string; // "Retrasado", "Entregado", "En tránsito"
  tramosDetalle?: SectionOrderRow[];
};

export type SimulationAction =
  | { type: 'SET_START_TIME'; payload: { startTime: Date; endTime: Date; }; }
  | { type: 'START_SIMULATION'; }
  | { type: 'STOP_SIMULATION'; }
  | { type: 'SET_COLAPSO'; payload: ColapsoInfo | null; }
  | { type: 'SET_SPEED'; payload: number; }
  | { type: 'UPDATE_VEHICLE_POSITION'; payload: Vehicle[]; }
  | { type: 'SET_CURRENT_TIME'; payload: Date; }
  | { type: 'SET_VEHICLES'; payload: Vehicle[]; }
  | { type: 'SET_CURRENT_BLOQUEOS'; payload: Bloqueo[]; }
  | { type: 'SET_PEDIDOS'; payload: PedidoSimulacion[]; }
  | { type: 'SET_OFFICES'; payload: Oficina[]; }
  | { type: 'SET_UNPLANNED_ORDERS'; payload: Order[]; }
  | { type: 'SET_PROCESSED_ORDER_IDS'; payload: string[]; }
  | { type: 'RESET_SIMULATION'; }  // Acción para reiniciar el estado
  | { type: 'SET_TOTAL_TRUCKS'; payload: number; }
  | { type: 'SET_OCCUPIED_OFFICES'; payload: number; }
  | { type: 'SET_TRUCKS_IN_MOTION'; payload: number; }
  | { type: 'SET_ORDERS_DELIVERED'; payload: number; }
  | { type: 'SET_ORDERS_PENDING'; payload: number; }
  | { type: 'SET_EXECUTION_START_TIME'; payload: Date; }
  | { type: 'SET_EXECUTION_END_TIME'; payload: Date; }
  | { type: 'ADD_HISTORY_ENTRY'; payload: { timestamp: Date; pedidos: OrderRow[]; camiones: TruckRow[]; }; }
  | { type: 'SET_SIMULATION_TYPE'; payload: 'SEMANAL' | 'COLAPSO'; }
  | { type: 'SET_VEHICULOS_AVERIADOS'; payload: VehiculoAveriadoAlgorithmResponse[]; };