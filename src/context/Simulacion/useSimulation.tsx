import { useContext } from "react";
import { SimulationContext } from "./SimulationContext";

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation solo se puede usar dentro de SimulationProvider");
  }
  return context;
};