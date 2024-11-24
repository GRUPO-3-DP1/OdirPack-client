import { Vehicle } from "../context/Simulacion/simulationTypes";

export const calculateOrdersDelivered = (vehicles: Vehicle[], currentTime: Date): number => {
  let deliveredOrders = 0;

  vehicles.forEach((vehicle) => {
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

  return deliveredOrders;
};