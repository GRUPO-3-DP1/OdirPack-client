import { Oficina } from "../context/Simulacion/simulationTypes";
import oficinas from "../data/oficinas";
import { OficinaAlgorithmResponse } from "../store/types/ResponseAlgorithm";

export const convertOffices = (oficinasData: OficinaAlgorithmResponse[]): Oficina[] => {
  return oficinasData.map((oficinaData) => {
    const matchingOficina = oficinas.find((o) => o.ubigeo === oficinaData.ubigeo);
    if (!matchingOficina) {
      throw new Error(`No se encontró una oficina con ubigeo ${oficinaData.ubigeo}`);
    }
    return {
      ...matchingOficina,
      horasStock: oficinaData.horas_stock,
      currentOrders: [],
    };
  });
};