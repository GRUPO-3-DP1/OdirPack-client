export type Pedido = {
    pedidoId: number;
    fechaRegistro: string; 
    fechaPlazoMaximo: string; 
    origenId: string;
    destinoId: string;
    cantidadTotal: number;
    clienteId: string;
    estado: 'PROCESSING' | 'COMPLETED' | 'CANCELLED'; // revisar estados
    fechaSalida: string | null;
    fechaLlegada: string | null;
};
