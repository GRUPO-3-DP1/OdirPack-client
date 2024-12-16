import { Vehicle } from "../context/Simulacion/simulationTypes";

export const calculateOrdersPending = (vehicles: Vehicle[], currentTime: Date): number => {
  let totalOrders = 0;
  let deliveredOrders = 0;

  vehicles.forEach((vehicle) => {
    const { ruta } = vehicle;

    // Filtrar solo los pedidos registrados hasta el currentTime
    const pedidosRegistrados = ruta.pedidos.filter((pedido) => {
      if (pedido.fechaRegistro) {
        const registrationTime = new Date(pedido.fechaRegistro);
        return registrationTime <= currentTime; // Solo pedidos registrados
      }
      return false;
    });

    // Incrementar el total de pedidos registrados
    totalOrders += pedidosRegistrados.length;

    // Verificar cuáles de esos pedidos registrados han sido entregados
    pedidosRegistrados.forEach((pedido) => {
      if (pedido.fechaLlegada) {
        const arrivalTime = new Date(pedido.fechaLlegada);

        // Contar como entregados si la llegada es anterior o igual al currentTime
        if (arrivalTime <= currentTime) {
          deliveredOrders += 1;
        }
      }
    });
  });

  return totalOrders - deliveredOrders;
};
