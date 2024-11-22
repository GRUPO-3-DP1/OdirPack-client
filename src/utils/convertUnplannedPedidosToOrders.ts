import { Order } from "../context/Simulacion/simulationTypes";
import { PedidoAlgorithmResponse } from "../store/types/ResponseAlgorithm";

export function convertUnplannedPedidosToOrders(pedidos: PedidoAlgorithmResponse[]): Order[] {
  return pedidos.map((pedido) => ({
    idPedido: pedido.idPedido,
    ubigeoDestino: pedido.ubigeoDestino,
    ubigeoOrigen: pedido.ubigeoOrigen,
    fechaRegistro: pedido.fechaRegistro,
    cantidad: pedido.cantidad,
    idCliente: pedido.idCliente,
    fechaLlegada: null,      // No tienen fecha de llegada aún
    fechaRecogida: null,     // No tienen fecha de recogida aún
  }));
}