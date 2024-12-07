import { ResponseAlgorithm, VehiculoAveriadoAlgorithmResponse, TramoAlgorithmResponse } from '../store/types/ResponseAlgorithm';
import { OrderRow, TruckRow } from '../context/Simulacion/simulationTypes'; 
import { formatDateAMPM } from './formatDateAMPM';

export function extractAllRutas(solutions: ResponseAlgorithm[]): { pedidos: OrderRow[], camiones: TruckRow[] } {
  const allSoluciones = solutions.flatMap(s => s.solucion);
  const vehiculosAveriadosMap = new Map<string, VehiculoAveriadoAlgorithmResponse>();

  for (const sol of solutions) {
    if (sol.vehiculosAveriados) {
      for (const va of sol.vehiculosAveriados) {
        vehiculosAveriadosMap.set(va.idVehiculo, va);
      }
    }
  }

  const pedidoRows: OrderRow[] = [];
  const camionRows: TruckRow[] = [];
  let routeCount = 0;

  for (const solItem of allSoluciones) {
    const rutasVehiculos = solItem.rutasVehiculos || {};

    for (const vehId in rutasVehiculos) {
      const veh = rutasVehiculos[vehId];
      if (!veh.ruta) continue;

      routeCount++;
      const ruta = veh.ruta;

      const inicio = formatDateAMPM(ruta.fechaInicio);
      const fin = ruta.fechasLlegada.length > 0 ? formatDateAMPM(ruta.fechasLlegada[ruta.fechasLlegada.length - 1]) : inicio;

      const origen = ruta.tramos.length > 0 ? `${ruta.tramos[0].origen.codigo} - ${ruta.tramos[0].origen.descripcion}` : 'N/A';
      const destino = ruta.tramos.length > 0 ? `${ruta.tramos[ruta.tramos.length - 1].destino.codigo} - ${ruta.tramos[ruta.tramos.length - 1].destino.descripcion}` : 'N/A';

      // Determinar estado camión
      let truckEstado: string;
      {
        const ultimaLlegada = ruta.fechasLlegada.length > 0 ? new Date(ruta.fechasLlegada[ruta.fechasLlegada.length - 1]) : new Date(ruta.fechaInicio);
        const ahora = new Date();
        if (veh.isAveriado) {
          truckEstado = 'Averiado';
        } else if (ultimaLlegada < ahora) {
          truckEstado = 'Completado';
        } else {
          truckEstado = 'En tránsito';
        }
      }

      const averia = veh.isAveriado;
      const averiaInfo = averia ? vehiculosAveriadosMap.get(veh.idVehiculo) : undefined;
      const horaAveria = averiaInfo?.horaAveria || 'Sin avería';

      const truckTramos = ruta.tramos.map((tramo:TramoAlgorithmResponse, i:number) => ({
        inicio: formatDateAMPM(ruta.fechasSalida[i]),
        fin: formatDateAMPM(ruta.fechasLlegada[i]),
        origen: `${tramo.origen.codigo} - ${tramo.origen.descripcion}`,
        destino: `${tramo.destino.codigo} - ${tramo.destino.descripcion}`,
        estado: truckEstado,
        horaAveria: horaAveria
      }));

      camionRows.push({
        id: routeCount,
        ruta: `R${routeCount.toString().padStart(3,'0')}`,
        camion: veh.idVehiculo,
        inicio: inicio,
        fin: fin,
        origen: origen,
        destino: destino,
        averia: averia,
        estado: truckEstado,
        tramosDetalle: truckTramos
      });

      for (const pedido of ruta.pedidos) {
        const pedidoEstado = pedido.estado || 'En tránsito';
        const pedidoInicio = inicio;
        const pedidoFin = fin;
      
        const pedidoTramos = ruta.tramos.map((t:TramoAlgorithmResponse, j:number) => ({
          inicio: formatDateAMPM(ruta.fechasSalida[j]),
          fin: formatDateAMPM(ruta.fechasLlegada[j]),
          origen: `${t.origen.codigo} - ${t.origen.descripcion}`,
          destino: `${t.destino.codigo} - ${t.destino.descripcion}`,
          estado: pedidoEstado,
          camion: veh.idVehiculo || 'N/A'
        }));
      
        pedidoRows.push({
          id: pedidoRows.length + 1,
          ruta: `R${routeCount.toString().padStart(3,'0')}`,
          pedido: pedido.idPedido,
          inicio: pedidoInicio,
          fin: pedidoFin,
          origen: origen,
          destino: destino,
          paquetes: pedido.cantidad,
          estado: pedidoEstado,
          tramosDetalle: pedidoTramos
        });
      }

    }
  }

  return { pedidos: pedidoRows, camiones: camionRows };
}