import { Order, Vehicle } from "../context/Simulacion/simulationTypes";
import { ResponseAlgorithm, VehiculoAveriadoAlgorithmResponse } from "../store/types/ResponseAlgorithm";
import { convertPedidosToOrders } from "./convertPedidosToOrders";
import { locationCoordinates } from "./locationCoordinates";

export const convertSolutionToVehicles = (solution: ResponseAlgorithm): Vehicle[] => {

  const convertedVehicles: Vehicle[] = [];

  if (!solution || !Array.isArray(solution.solucion) || solution.solucion.length === 0) {
    return convertedVehicles;
  }

  // Crear un mapa de averías por ID de vehículo
  const averiasMap = new Map<string, VehiculoAveriadoAlgorithmResponse>();
  solution.vehiculosAveriados.forEach((averiado) => {
    averiasMap.set(averiado.idVehiculo, averiado);
  });

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

      // Verificar si el vehículo está en la lista de averías
      const averia = averiasMap.get(vehicleItem.idVehiculo);
      // Asignar datos de avería si corresponde
      const averiaInfo = averia
        ? {
            isAveria: true,
            tipo: averia.tipoAveria || '', // Valor predeterminado si no está presente
            fechaRegistro: averia.horaAveria || '', // Valor predeterminado si no está presente
            ubiInicio: averia.tramoInicio || '', // Valor predeterminado si no está presente
            ubiFin: averia.tramoFin || '', // Valor predeterminado si no está presente
            fechaReparacion: averia.fechaReparacion || '', // En lugar de null, asignamos una cadena vacía
            cargaReplanificada: false, // Valor predeterminado si no está presente
            almacenReaparicion: ''
          }
        : {
            isAveria: false,
            tipo: '',
            fechaRegistro: '',
            ubiInicio: '',
            ubiFin: '',
            fechaReparacion: '',
            cargaReplanificada: false,
            almacenReaparicion: ''
          };

      return {
        idVehiculo: vehicleItem.idVehiculo,
        almacenOrigen: vehicleItem.almacenOrigen,
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
        averia:averiaInfo
      };
    });
  });

  convertedVehicles.push(...vehicles);
  return convertedVehicles;
};