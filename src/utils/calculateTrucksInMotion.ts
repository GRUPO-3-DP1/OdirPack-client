import { Vehicle } from "../context/Simulacion/simulationTypes";

export const calculateTrucksInMotion = (vehicles: Vehicle[]): number => {
  return vehicles.filter((vehicle) => vehicle.position.currentSegmentIndex !== -1).length;
};