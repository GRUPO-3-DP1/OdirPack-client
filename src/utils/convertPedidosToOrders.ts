import { Order } from "../context/Simulacion/simulationTypes";
import { PedidoAlgorithmResponse } from "../store/types/ResponseAlgorithm";

export function convertPedidosToOrders(
  pedidos: PedidoAlgorithmResponse[]
): Order[] {
  return pedidos.map((pedido) => {
    const fechaRecogida = pedido.fechaLlegada;

    return {
      idPedido: pedido.idPedido,
      ubigeoDestino: pedido.ubigeoDestino,
      ubigeoOrigen: pedido.ubigeoOrigen,
      fechaRegistro: pedido.fechaRegistro,
      cantidad: pedido.cantidad,
      idCliente: pedido.idCliente,
      fechaLlegada: pedido.fechaLlegada,
      fechaRecogida: fechaRecogida,
    };
  });
}
