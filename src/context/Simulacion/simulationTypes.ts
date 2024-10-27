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
  fechaLibre: string|null;
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
};

export type SimulationAction =
  | { type: 'START_SIMULATION'; payload: { startTime: Date; endTime: Date; }; }
  | { type: 'STOP_SIMULATION'; }
  | { type: 'SET_SPEED'; payload: number; }
  | { type: 'UPDATE_VEHICLE_POSITION'; payload: Vehicle[]; }
  | { type: 'SET_CURRENT_TIME'; payload: Date; }
  | { type: 'SET_VEHICLES'; payload: Vehicle[]; }; // Ensure this is defined

