import { Oficina } from "../context/Simulacion/simulationTypes";

// Función para calcular la cantidad de pedidos en oficinas
  // Calcular pedidos en cada oficina y actualizar las oficinas
  export const updateOfficesWithOrders = (offices: Oficina[], state: any, dispatch: any): void => {
    const updatedOffices = offices.map((office) => {
      // Calcula la cantidad de pedidos válidos para la oficina
      const totalCantidadPedidos = state.vehicles
        .flatMap((vehicle: { ruta: { pedidos: any; }; }) => vehicle.ruta?.pedidos || [])
        .reduce((total: any, pedido: { ubigeoDestino: string; fechaLlegada: string | number | Date; cantidad: any; }) => {
          const perteneceOficina = pedido.ubigeoDestino === office.ubigeo;
          const fechaLlegada = pedido.fechaLlegada ? new Date(pedido.fechaLlegada) : null;
          if (!perteneceOficina || !fechaLlegada) return total;
          const tiempoLimite = new Date(fechaLlegada.getTime() + 4 * 60 * 60 * 1000);
          const estaEnRango = state.currentTime >= fechaLlegada && state.currentTime <= tiempoLimite;
          return estaEnRango ? total + (pedido.cantidad || 0) : total;
        }, 0);

      // Agrega la cantidad de pedidos válidos como propiedad a la oficina
      return {
        ...office,
        totalCantidadPedidos, // Nueva propiedad para cada oficina
      };
  });

  // Actualiza el estado de las oficinas en el contexto
  dispatch({ type: 'SET_OFFICES', payload: updatedOffices });
};
