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
    ubigeoDestino: string; // Código del ubigeo de destino
    fechaRegistro: string;
    cantidad: number;
    idCliente: string;
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
    capacidadCarga: number;
    fechaLibre: string | null;
};

export type RutaVehiculoAlgorithmResponse = {
    vehiculo: VehiculoAlgorithmResponse;
    ruta: Ruta;
};

export type SolucionAlgorithmResponse = {
    rutasVehiculos: {
        [key: string]: RutaVehiculoAlgorithmResponse;
    };
    costoTotal: number;
};

export type OficinaAlgorithmResponse = {
    ubigeo: string;
    horas_stock: any[]; // Cambia el tipo según lo que contenga horas_stock
};

export type ResponseAlgorithm = {
    mensaje: string;
    solucion: SolucionAlgorithmResponse[];
    pedidosNoPlanificados: PedidoAlgorithmResponse[];
    oficinas: OficinaAlgorithmResponse[];
    yaNoPlanificar: boolean;
};