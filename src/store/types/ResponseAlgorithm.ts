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
    ubigeoOrigen: string|null;
    ubigeoDestino: string; // Código del ubigeo de destino
    fechaRegistro: string;
    fechaLlegada: string|null;
    fechaPlazoMaximo: string;
    cantidad: number;
    idCliente: string;
    estado: string;
};

export type Ruta = {
    tramos: TramoAlgorithmResponse[]; // Lista de tramos en la ruta
    pedidos: PedidoAlgorithmResponse[]; // Lista de pedidos asociados a la ruta
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
    ruta: Ruta|null;
};

export type RutasVehiculosAlgorithmResponse = {
    [key: string]: VehiculoAlgorithmResponse; // Permite claves dinámicas para los vehículos
};

export type SolucionAlgorithmResponse = {
    rutasVehiculos: RutasVehiculosAlgorithmResponse; // Cambia a la nueva definición
    costoTotal: number;
};


export type OficinaAlgorithmResponse = {
    ubigeo: string;
    horas_stock: any[]; // Cambia el tipo según lo que contenga horas_stock
};

export type VehiculoAveriadoAlgorithmResponse = {
    idVehiculo: string; // ID del vehículo averiado
    almacenReaparicion: string;
    tipoAveria: string; // Tipo de avería ("SINIESTRO", "FUERTE", "MODERADA")
    tramoInicio: string; // Código del Ubigeo de inicio del tramo
    tramoFin: string; // Código del Ubigeo de fin del tramo
    horaAveria: string; // Hora exacta en la que ocurrió la avería (ISO 8601)
    fechaReparacion: string; // Fecha en la que el vehículo estará operativo (ISO 8601)
};


export type ResponseAlgorithm = {
    mensaje: string;
    solucion: SolucionAlgorithmResponse[];
    pedidosNoPlanificados: PedidoAlgorithmResponse[];
    oficinas: OficinaAlgorithmResponse[];
    vehiculosAveriados: VehiculoAveriadoAlgorithmResponse[];
    yaNoPlanificar: boolean;
};

