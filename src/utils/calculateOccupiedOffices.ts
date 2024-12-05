import { Oficina } from "../context/Simulacion/simulationTypes";

// Función para calcular oficinas ocupadas
export const calculateOccupiedOffices = (offices: Oficina[]): number => {
  let occupied = 0;
  offices.forEach((office) => {
    if ((office.horasStock ?? []).some((horaStock) => horaStock.stock > 0)) {
      occupied += 1;
    }
  });
  return occupied;
};