import { useContext } from "react";
import { OperacionContext } from "./OperacionContext";
import { OperacionContextType } from './operacionTypes';

export const useOperacion = (): OperacionContextType => {
  const context = useContext(OperacionContext);
  if (!context) {
    throw new Error("useOperacion debe usarse dentro de OperacionProvider");
  }
  return context;
};