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

export type Vehicle = {
  idVehiculo: string;
  capacidadCarga: number;
  fechaLibre: string;
  ruta: Route;
};

export type VehiclePosition = {
  lat: number;
  lng: number;
  progress: number;
  currentSegmentIndex: number;
};

export type SimulationState = {
  isPlaying: boolean;
  vehicles: Map<string, VehiclePosition>;
  speed: number;
  startTime: Date;
  currentTime: Date;
  endTime: Date;
};

export type SimulationAction =
  | { type: 'START_SIMULATION'; payload: { startTime: Date; endTime: Date; }; }
  | { type: 'STOP_SIMULATION'; }
  | { type: 'SET_SPEED'; payload: number; }
  | { type: 'UPDATE_VEHICLE_POSITION'; payload: { vehicleId: string; position: VehiclePosition; }; }
  | { type: 'SET_CURRENT_TIME'; payload: Date; };