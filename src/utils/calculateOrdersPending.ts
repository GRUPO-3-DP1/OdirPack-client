import { Vehicle } from "../context/Simulacion/simulationTypes";

export const calculateOrdersPending = (vehicles: Vehicle[], currentTime: Date): number => {
  let totalOrders = 0;
  let deliveredOrders = 0;

  vehicles.forEach((vehicle) => {
    totalOrders += vehicle.ruta.pedidos.length;
    const { ruta } = vehicle;
    ruta.pedidos.forEach((pedido) => {
      if (pedido.fechaLlegada) {
        const arrivalTime = new Date(pedido.fechaLlegada);
        if (arrivalTime <= currentTime) {
          deliveredOrders += 1;
        }
      }
    });
  });

  return totalOrders - deliveredOrders;
};