import dayjs from 'dayjs';
import { SimulationState, OrderRow, TruckRow } from '../context/Simulacion/simulationTypes';

export function generarDatosFinales(state: SimulationState): { pedidos: OrderRow[], camiones: TruckRow[] } {
  const pedidosFinales: OrderRow[] = [];
  const camionesFinales: TruckRow[] = [];

  let truckIdCounter = 1;
  let orderIdCounter = 1;

  const endTime = state.endTime;

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '';
    return dayjs(dateString).format('DD/MM/YYYY, HH:mm');
  };

  state.vehicles.forEach((vehicle) => {
    const ruta = vehicle.ruta;
    const inicioRuta = formatDate(ruta.fechaInicio);
    const finRuta = ruta.fechasLlegada.length > 0
      ? formatDate(ruta.fechasLlegada[ruta.fechasLlegada.length - 1])
      : inicioRuta;

    const origen = ruta.tramos.length > 0 ? `${ruta.tramos[0].origen.codigo} - ${ruta.tramos[0].origen.descripcion}` : 'N/A';
    const destino = ruta.tramos.length > 0 ? `${ruta.tramos[ruta.tramos.length - 1].destino.codigo} - ${ruta.tramos[ruta.tramos.length - 1].destino.descripcion}` : 'N/A';

    // Determinar estado del camión
    let truckEstado: string;
    const ultimaLlegada = ruta.fechasLlegada.length > 0 ? new Date(ruta.fechasLlegada[ruta.fechasLlegada.length - 1]) : null;

    // Lógica para determinar el estado final:
    // 1. Si el camión está en mantenimiento (avería sin terminar)
    const averia = vehicle.averia?.isAveria || false;
    const maintenanceActive = vehicle.maintenance?.inMaintenance || false;

    // 2. Si la última llegada es posterior al endTime, significa que el camión no terminó su ruta
    if (averia || maintenanceActive) {
      truckEstado = 'Averiado'; // o 'Mantenimiento' si quieres distinguir
    } else if (ultimaLlegada && endTime < ultimaLlegada) {
      truckEstado = 'En tránsito';
    } else {
      // Si terminó todos los tramos antes o justo al endTime:
      truckEstado = 'Completado';
    }

    const truckTramos = ruta.tramos.map((tramo, i) => ({
      horaAveria: averia ? 'Desconocida' : '',
      inicio: formatDate(ruta.fechasSalida[i]) || '',
      fin: formatDate(ruta.fechasLlegada[i]) || '',
      origen: `${tramo.origen.codigo} - ${tramo.origen.descripcion}`,
      destino: `${tramo.destino.codigo} - ${tramo.destino.descripcion}`,
      estado: truckEstado
    }));

    camionesFinales.push({
      id: truckIdCounter,
      ruta: `R${truckIdCounter.toString().padStart(3, '0')}`,
      camion: vehicle.idVehiculo,
      inicio: inicioRuta,
      fin: finRuta,
      origen: origen,
      destino: destino,
      averia: averia,
      estado: truckEstado,
      tramosDetalle: truckTramos
    });

    // Procesar pedidos del vehículo
    ruta.pedidos.forEach((pedido) => {
      let pedidoEstado = 'En tránsito';
      const fechaLlegadaPedido = pedido.fechaLlegada ? new Date(pedido.fechaLlegada) : null;
      if (fechaLlegadaPedido && dayjs(fechaLlegadaPedido).isBefore(endTime)) {
        pedidoEstado = 'Entregado';
      } else if (!fechaLlegadaPedido && dayjs(endTime).isAfter(ruta.fechaInicio)) {
        // Si no llegó y ya pasó el endTime, podría ser Retrasado
        pedidoEstado = 'Retrasado';
      }

      const inicioPedido = formatDate(pedido.fechaRegistro);
      const finPedido = pedido.fechaLlegada ? formatDate(pedido.fechaLlegada) : inicioPedido;

      const pedidoRow: OrderRow = {
        id: orderIdCounter++,
        ruta: `R${truckIdCounter.toString().padStart(3, '0')}`,
        pedido: pedido.idPedido,
        inicio: inicioPedido,
        fin: finPedido,
        origen: pedido.ubigeoOrigen || 'N/A',
        destino: pedido.ubigeoDestino,
        paquetes: pedido.cantidad,
        estado: pedidoEstado,
      };

      pedidosFinales.push(pedidoRow);
    });

    truckIdCounter++;
  });

  return { pedidos: pedidosFinales, camiones: camionesFinales };
}
