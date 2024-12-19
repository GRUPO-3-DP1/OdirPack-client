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

    console.log(`Procesando camión ${vehicle.idVehiculo}`);
    console.log('Ruta:', ruta);
    console.log('Tramos de la ruta:', ruta.tramos);

    if (!ruta || !ruta.tramos || ruta.tramos.length === 0) {
      console.log(`Saltando camión ${vehicle.idVehiculo} porque no tiene tramos asignados.`);
      return; // Saltar a la siguiente iteración
    }

    const inicioRuta = ruta.fechaInicio
      ? formatDate(ruta.fechaInicio)
      : formatDate(state.startTime);
    const finRuta = ruta.fechasLlegada.length > 0
      ? formatDate(ruta.fechasLlegada[ruta.fechasLlegada.length - 1])
      : formatDate(state.endTime);

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

    // Para camiones - calcular 'Origen' y 'Destino'
    let origenCamionStr: string;
    let destinoCamionStr: string;

    if (ruta.tramos && ruta.tramos.length > 0) {
      const primerTramo = ruta.tramos[0];
      const ultimoTramo = ruta.tramos[ruta.tramos.length - 1];

      const origenProv = obtenerProvincia(primerTramo.origen.codigo);
      const destinoProv = obtenerProvincia(ultimoTramo.destino.codigo);

      origenCamionStr = `${primerTramo.origen.codigo} - ${origenProv}`;
      destinoCamionStr = `${ultimoTramo.destino.codigo} - ${destinoProv}`;
    } else {
      origenCamionStr = 'N/A';
      destinoCamionStr = 'N/A';
      console.log(`El camión ${vehicle.idVehiculo} no tiene tramos asignados.`);
    }

    // Tramos del camión
    const truckTramos = ruta.tramos.length > 0
      ? ruta.tramos.map((tramo, i) => {
          const tramoInicio = ruta.fechasSalida[i]
            ? formatDate(ruta.fechasSalida[i])
            : formatDate(state.startTime);
          const tramoFin = ruta.fechasLlegada[i]
            ? formatDate(ruta.fechasLlegada[i])
            : formatDate(state.endTime);
          const origenProv = obtenerProvincia(tramo.origen.codigo);
          const destinoProv = obtenerProvincia(tramo.destino.codigo);

          return {
            inicio: tramoInicio,
            fin: tramoFin,
            origen: `${tramo.origen.codigo} - ${origenProv}`,
            destino: `${tramo.destino.codigo} - ${destinoProv}`,
            estado: truckEstado,
            horaAveria: horaAveriaText
          };
        })
      : [{
          inicio: inicioRuta,
          fin: finRuta,
          origen: origenCamionStr,
          destino: destinoCamionStr,
          estado: truckEstado,
          horaAveria: horaAveriaText
        }];

      camionesFinales.push({
        id: truckIdCounter,
        ruta: `R${truckIdCounter.toString().padStart(3, '0')}`,
        camion: vehicle.idVehiculo,
        inicio: inicioRuta,
        fin: finRuta,
        origen: origenCamionStr,      // Usar las variables correctas
        destino: destinoCamionStr,    // Usar las variables correctas
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
