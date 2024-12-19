import dayjs from 'dayjs';
import { SimulationState, OrderRow, TruckRow } from '../context/Simulacion/simulationTypes';
import oficinas from '../data/oficinas';

function obtenerProvincia(ubigeo: string): string {
  const found = oficinas.find(o => o.ubigeo === ubigeo);
  return found ? found.provincia : 'DESCONOCIDA';
}

function formatDate(dateString?: string | null | Date): string {
  if (!dateString) return '';
  const d = (dateString instanceof Date) ? dateString : new Date(dateString);
  return dayjs(d).format('DD/MM/YYYY, HH:mm');
}

export function generarDatosFinales(state: SimulationState): { pedidos: OrderRow[], camiones: TruckRow[] } {
  const pedidosFinales: OrderRow[] = [];
  const camionesFinales: TruckRow[] = [];

  let truckIdCounter = 1;
  let orderIdCounter = 1;

  const endTime = state.endTime;

  state.vehicles.forEach((vehicle) => {
    const ruta = vehicle.ruta;

    const inicioRuta = ruta.fechaInicio
      ? formatDate(ruta.fechaInicio)
      : formatDate(state.startTime);
    const finRuta = ruta.fechasLlegada.length > 0
      ? formatDate(ruta.fechasLlegada[ruta.fechasLlegada.length - 1])
      : formatDate(state.endTime);

    let origen: string;
    let destino: string;

    // Determinar origen/destino para camiones
    if (ruta.tramos.length > 0) {
      const primerTramo = ruta.tramos[0];
      const ultimoTramo = ruta.tramos[ruta.tramos.length - 1];
      const origenUbigeo = primerTramo.origen.codigo;
      const destinoUbigeo = ultimoTramo.destino.codigo;
      origen = `${origenUbigeo}-${obtenerProvincia(origenUbigeo)}`;
      destino = `${destinoUbigeo}-${obtenerProvincia(destinoUbigeo)}`;
    } else {
      // Sin tramos: poner N/A directamente
      origen = 'N/A';
      destino = 'N/A';
    }

    // Estado del camión
    const averia = vehicle.averia?.isAveria || false;
    const maintenanceActive = vehicle.maintenance?.inMaintenance || false;
    const ultimaLlegada = ruta.fechasLlegada.length > 0 ? new Date(ruta.fechasLlegada[ruta.fechasLlegada.length - 1]) : null;

    let truckEstado: string;
    if (averia || maintenanceActive) {
      truckEstado = 'Averiado';
    } else if (ultimaLlegada && endTime < ultimaLlegada) {
      truckEstado = 'En tránsito';
    } else {
      truckEstado = 'Completado';
    }

    const horaAveriaText = averia ? 'Desconocida' : 'Sin avería';

    // Tramos del camión
    const truckTramos = ruta.tramos.length > 0
      ? ruta.tramos.map((tramo, i) => {
          const tramoInicio = ruta.fechasSalida[i] ? formatDate(ruta.fechasSalida[i]) : formatDate(state.startTime);
          const tramoFin = ruta.fechasLlegada[i] ? formatDate(ruta.fechasLlegada[i]) : formatDate(endTime);
          const origenProv = obtenerProvincia(tramo.origen.codigo);
          const destinoProv = obtenerProvincia(tramo.destino.codigo);
          return {
            horaAveria: horaAveriaText,
            inicio: tramoInicio,
            fin: tramoFin,
            origen: `${tramo.origen.codigo} - ${origenProv}`,
            destino: `${tramo.destino.codigo} - ${destinoProv}`,
            estado: truckEstado
          };
        })
      : [{
          horaAveria: horaAveriaText,
          inicio: inicioRuta,
          fin: finRuta,
          origen: 'N/A',
          destino: 'N/A',
          estado: truckEstado
        }];

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

    // Pedidos
    ruta.pedidos.forEach((pedido) => {
      const fechaLlegadaPedido = pedido.fechaLlegada ? new Date(pedido.fechaLlegada) : null;
      let pedidoEstado = 'En tránsito';
      if (fechaLlegadaPedido && dayjs(fechaLlegadaPedido).isBefore(endTime)) {
        pedidoEstado = 'Entregado';
      } else if (!fechaLlegadaPedido && dayjs(endTime).isAfter(ruta.fechaInicio)) {
        pedidoEstado = 'Retrasado';
      }

      const inicioPedido = pedido.fechaRegistro
        ? formatDate(pedido.fechaRegistro)
        : inicioRuta;
      const finPedido = pedido.fechaLlegada
        ? formatDate(pedido.fechaLlegada)
        : (pedidoEstado === 'Retrasado' ? formatDate(endTime) : inicioPedido);

      // Para pedidos
      let origenPedidoStr: string;
      let destinoPedidoStr: string;

      // if (pedido.ubigeoOrigen && pedido.ubigeoDestino) {
      //   // Si hay ubigeos definidos para el pedido
      //   const origenProv = obtenerProvincia(pedido.ubigeoOrigen);
      //   const destinoProv = obtenerProvincia(pedido.ubigeoDestino);
      //   origenPedidoStr = `${pedido.ubigeoOrigen}-${origenProv}`;
      //   destinoPedidoStr = `${pedido.ubigeoDestino}-${destinoProv}`;
      // } else {
      //   // Si no hay ubigeos definidos, usar N/A
      //   origenPedidoStr = 'N/A';
      //   destinoPedidoStr = 'N/A';
      // }

      if (ruta.tramos.length > 0) {
        const primerTramo = ruta.tramos[0];
        const ultimoTramo = ruta.tramos[ruta.tramos.length - 1];
      
        const origenProv = obtenerProvincia(primerTramo.origen.codigo);
        const destinoProv = obtenerProvincia(ultimoTramo.destino.codigo);
      
        origenPedidoStr = `${primerTramo.origen.codigo} - ${origenProv}`;
        destinoPedidoStr = `${ultimoTramo.destino.codigo} - ${destinoProv}`;
      } else {
        origenPedidoStr = 'N/A';
        destinoPedidoStr = 'N/A';
      }

      const pedidoTramos = ruta.tramos.length > 0
        ? ruta.tramos.map((t, j) => {
            const tramoInicio = ruta.fechasSalida[j] ? formatDate(ruta.fechasSalida[j]) : formatDate(state.startTime);
            const tramoFin = ruta.fechasLlegada[j] ? formatDate(ruta.fechasLlegada[j]) : formatDate(endTime);
            const origenProv = obtenerProvincia(t.origen.codigo);
            const destinoProv = obtenerProvincia(t.destino.codigo);
            return {
              inicio: tramoInicio,
              fin: tramoFin,
              origen: `${t.origen.codigo} - ${origenProv}`,
              destino: `${t.destino.codigo} - ${destinoProv}`,
              estado: pedidoEstado,
              camion: vehicle.idVehiculo || 'N/A'
            };
          })
        : [{
            inicio: inicioPedido,
            fin: finPedido,
            origen: 'N/A',
            destino: 'N/A',
            estado: pedidoEstado,
            camion: vehicle.idVehiculo || 'N/A'
          }];

      const pedidoRow: OrderRow = {
        id: orderIdCounter++,
        ruta: `R${truckIdCounter.toString().padStart(3, '0')}`,
        pedido: pedido.idPedido,
        inicio: inicioPedido,
        fin: finPedido,
        origen: origenPedidoStr,
        destino: destinoPedidoStr,
        paquetes: pedido.cantidad,
        estado: pedidoEstado,
        tramosDetalle: pedidoTramos
      };

      pedidosFinales.push(pedidoRow);
    });

    truckIdCounter++;
  });

  return { pedidos: pedidosFinales, camiones: camionesFinales };
}
