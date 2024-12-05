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

/*export type Vehicle = {
  idVehiculo: string;
  capacidadCarga: number;
  fechaLibre: string|null;
  ruta: Route;
  position: VehiclePosition;
};*/


export type Vehicle = {
  idVehiculo: string;
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
  averia?: {
    isAveria: boolean;
    tipo: string;
    fechaRegistro: string;
    ubiInicio: string;
    ubiFin: string;
    fechaReparacion: string | null;
    cargaReplanificada: boolean;
  }
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
  offices: Oficina[];             // Añadir oficinas
  unplannedOrders: Order[];      // Añadir pedidos no planificados
  processedOrderIds: string[];
  operationType: string;
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

export type SimulationAction =
  | { type: 'START_SIMULATION'; payload: { startTime: Date; endTime: Date; operationType: 'semanal' | 'colapso' | 'diaadia'; }; }
  | { type: 'STOP_SIMULATION'; }
  | { type: 'SET_SPEED'; payload: number; }
  | { type: 'UPDATE_VEHICLE_POSITION'; payload: Vehicle[]; }
  | { type: 'SET_CURRENT_TIME'; payload: Date; }
  | { type: 'SET_VEHICLES'; payload: Vehicle[]; }
  //| { type: 'UPDATE_SIMULATION_DATA'; payload: Partial<SimulationState>; }
  | { type: 'SET_OFFICES'; payload: Oficina[]; }
  | { type: 'SET_UNPLANNED_ORDERS'; payload: Order[]; }
  | { type: 'SET_PROCESSED_ORDER_IDS'; payload: string[]; }
  | { type: 'RESET_SIMULATION';}  // Acción para reiniciar el estado
  | { type: 'SET_TOTAL_TRUCKS'; payload: number }
  | { type: 'SET_OCCUPIED_OFFICES'; payload: number }
  | { type: 'SET_TRUCKS_IN_MOTION'; payload: number }
  | { type: 'SET_ORDERS_DELIVERED'; payload: number }
  | { type: 'SET_ORDERS_PENDING'; payload: number };

  