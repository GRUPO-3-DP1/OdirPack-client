export type UbigeoAlgorithmResponse = {
    codigo: string;
    descripcion: string;
  };
  
  export type TramoAlgorithmResponse = {
    origen: UbigeoAlgorithmResponse;
    destino: UbigeoAlgorithmResponse;
  };
  
  export type PedidoAlgorithmResponse = {
    idPedido: string;
    ubigeoOrigen: string | null;
    ubigeoDestino: string;
    fechaRegistro: string;
    fechaLlegada: string | null;
    fechaSalida: string | null;
    fechaPlazoMaximo: string;
    cantidad: number;
    idCliente: string;
    estado: string;
    isReplanificado: boolean;
  };
  
  export type Ruta = {
    tramos: TramoAlgorithmResponse[];
    pedidos: PedidoAlgorithmResponse[];
    fechaInicio: string;
    fechasSalida: string[];
    fechasLlegada: string[];
  };
  
  export type VehiculoAlgorithmResponse = {
    idVehiculo: string;
    almacenOrigen: string;
    capacidadCarga: number;
    isAveriado: boolean;
    fechaLibre: string | null;
    ruta: Ruta | null;
  };
  
  export type RutasVehiculosAlgorithmResponse = {
    [key: string]: VehiculoAlgorithmResponse; 
  };
  
  export type SolucionAlgorithmResponse = {
    rutasVehiculos: RutasVehiculosAlgorithmResponse;
    costoTotal: number;
  };
  
  export type OficinaAlgorithmResponse = {
    ubigeo: string;
    horas_stock: any[]; // Ajusta el tipo real si se conoce la estructura de horas_stock
  };
  
  export type VehiculoAveriadoAlgorithmResponse = {
    idVehiculo: string;
    almacenAsignado: string;
    tipoAveria: string; 
    tramoInicio: string; 
    tramoFin: string; 
    horaAveria: string; 
    fechaReparacion: string; 
  };
  
  export type ResponseAlgorithm = {
    mensaje: string;
    solucion: SolucionAlgorithmResponse[];
    pedidosNoPlanificados: PedidoAlgorithmResponse[];
    oficinas: OficinaAlgorithmResponse[];
    vehiculosAveriados: VehiculoAveriadoAlgorithmResponse[];
    yaNoPlanificar: boolean;
    pedidoColapso?: PedidoAlgorithmResponse | null; // Campo para indicar el pedido que ocasiona el colapso
    fechaInicio: string; // Fecha de inicio recibida del backend
    fechaFin: string;    // Fecha de fin recibida del backend
  };
  