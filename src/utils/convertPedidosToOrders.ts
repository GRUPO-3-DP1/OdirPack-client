import { Order } from "../context/Simulacion/simulationTypes";
import { PedidoAlgorithmResponse } from "../store/types/ResponseAlgorithm";

export function convertPedidosToOrders(
  pedidos: PedidoAlgorithmResponse[],
  tramoDestinoFechaMap: Record<string, string>,
  tramoOrigenFechaMap: Record<string, string>,
  rutaFechaInicio: string
): Order[] {
  return pedidos.map((pedido) => ({
    idPedido: pedido.idPedido,
    ubigeoDestino: pedido.ubigeoDestino,
    ubigeoOrigen: pedido.ubigeoOrigen,
    fechaRegistro: pedido.fechaRegistro,
    cantidad: pedido.cantidad,
    idCliente: pedido.idCliente,
    fechaLlegada: tramoDestinoFechaMap[pedido.ubigeoDestino] || null,
    fechaRecogida: pedido.ubigeoOrigen
      ? tramoOrigenFechaMap[pedido.ubigeoOrigen] || rutaFechaInicio
      : rutaFechaInicio,
  }));
}