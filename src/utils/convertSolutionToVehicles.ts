import { Order, Vehicle } from "../context/Simulacion/simulationTypes";
import { ResponseAlgorithm } from "../store/types/ResponseAlgorithm";
import { convertPedidosToOrders } from "./convertPedidosToOrders";
import { locationCoordinates } from "./locationCoordinates";

export const convertSolutionToVehicles = (solution: ResponseAlgorithm): Vehicle[] => {

  const convertedVehicles: Vehicle[] = [];

  if (!solution || !Array.isArray(solution.solucion) || solution.solucion.length === 0) {
    return convertedVehicles;
  }

  const vehicles = solution.solucion.flatMap((item) => {
    if (!item.rutasVehiculos) {
      return [];
    }

    return Object.values(item.rutasVehiculos).flatMap((vehicleItem) => {
      if (!vehicleItem) {
        return [];
      }
      if (!vehicleItem.ruta) {
        return [];
      }

      const firstTramo = vehicleItem.ruta.tramos[0];
      const destinationCode = firstTramo ? firstTramo.destino.codigo : '';
      const locationCoordinate = locationCoordinates[destinationCode] || { lat: 0, lng: 0 };

      // Crear un mapa de destino a fecha de llegada
      const tramoDestinoFechaMap: Record<string, string> = {};
      for (let i = 0; i < vehicleItem.ruta.tramos.length; i++) {
        const tramo = vehicleItem.ruta.tramos[i];
        const fechaLlegada = vehicleItem.ruta.fechasLlegada[i];
        tramoDestinoFechaMap[tramo.destino.codigo] = fechaLlegada;
      }

      // Crear un mapa de origen a fecha de salida
      const tramoOrigenFechaMap: Record<string, string> = {};
      for (let i = 0; i < vehicleItem.ruta.tramos.length; i++) {
        const tramo = vehicleItem.ruta.tramos[i];
        const fechaSalida = vehicleItem.ruta.fechasSalida[i];
        tramoOrigenFechaMap[tramo.origen.codigo] = fechaSalida;
      }

      // Asignar fechaLlegada a cada pedido
      const pedidos: Order[] = convertPedidosToOrders(
        vehicleItem.ruta.pedidos,
        tramoDestinoFechaMap,
        tramoOrigenFechaMap,
        vehicleItem.ruta.fechaInicio
      );

      return {
        idVehiculo: vehicleItem.idVehiculo,
        capacidadCarga: vehicleItem.capacidadCarga,
        fechaLibre: vehicleItem.fechaLibre || null,
        ruta: {
          tramos: vehicleItem.ruta.tramos.map((tramo) => ({
            origen: {
              codigo: tramo.origen.codigo,
              descripcion: tramo.origen.descripcion,
            },
            destino: {
              codigo: tramo.destino.codigo,
              descripcion: tramo.destino.descripcion,
            },
          })),
          pedidos: pedidos,
          fechaInicio: vehicleItem.ruta.fechaInicio,
          fechasSalida: vehicleItem.ruta.fechasSalida,
          fechasLlegada: vehicleItem.ruta.fechasLlegada,
        },
        position: {
          lat: locationCoordinate.lat,
          lng: locationCoordinate.lng,
          progress: 0,
          currentSegmentIndex: -1,
        },
      };
    });
  });

  convertedVehicles.push(...vehicles);
  return convertedVehicles;
};