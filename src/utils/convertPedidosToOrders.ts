import { Order } from "../context/Simulacion/simulationTypes";
import { PedidoAlgorithmResponse } from "../store/types/ResponseAlgorithm";

export function convertPedidosToOrders(
  pedidos: PedidoAlgorithmResponse[],
  tramoDestinoFechaMap: Record<string, string>,
  tramoOrigenFechaMap: Record<string, string>,
  rutaFechaInicio: string
): Order[] {
  return pedidos.map((pedido) => {
    const fechaLlegada = tramoDestinoFechaMap[pedido.ubigeoDestino] || null;
    const fechaRecogida = pedido.ubigeoOrigen
      ? tramoOrigenFechaMap[pedido.ubigeoOrigen] || rutaFechaInicio
      : rutaFechaInicio;

    return {
      idPedido: pedido.idPedido,
      ubigeoDestino: pedido.ubigeoDestino,
      ubigeoOrigen: pedido.ubigeoOrigen,
      fechaRegistro: pedido.fechaRegistro,
      cantidad: pedido.cantidad,
      idCliente: pedido.idCliente,
      fechaLlegada: fechaLlegada,
      fechaRecogida: fechaRecogida,
    };
  });
}
