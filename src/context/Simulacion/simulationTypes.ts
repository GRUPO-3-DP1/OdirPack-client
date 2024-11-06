type Location = {
  codigo: string;
  descripcion: string;
};

type RouteSegment = {
  origen: Location;
  destino: Location;
};

type Order = {
  idPedido: string;
  ubigeoDestino: string;
  fechaRegistro: string;
  cantidad: number;
  idCliente: string;
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
  capacidadCarga: number;
  fechaLibre: string | null;
  ruta: Route;
  position: VehiclePosition;
};


export type SimulationState = {
  isPlaying: boolean;
  vehicles: Vehicle[];
  speed: number;
  startTime: Date;
  currentTime: Date;
  endTime: Date;
  ends: boolean;
  trucksInMotion: number;        // Número de camiones en movimiento
  trucksInMaintenance: number;   // Número de camiones en mantenimiento
  totalTrucks: number;           // Capacidad total de la flota
  totalOffices: number;          // Total de oficinas
  occupiedOffices: number;       // Oficinas ocupadas
  ordersDelivered: number;       // Pedidos entregados
  ordersPending: number;         // Pedidos pendientes
};

export type SimulationAction =
  | { type: 'START_SIMULATION'; payload: { startTime: Date; endTime: Date; }; }
  | { type: 'STOP_SIMULATION'; }
  | { type: 'SET_SPEED'; payload: number; }
  | { type: 'UPDATE_VEHICLE_POSITION'; payload: Vehicle[]; }
  | { type: 'SET_CURRENT_TIME'; payload: Date; }
  | { type: 'SET_VEHICLES'; payload: Vehicle[]; }
  | { type: 'UPDATE_SIMULATION_DATA'; payload: Partial<SimulationState>; }; //Nuevo recien creado

