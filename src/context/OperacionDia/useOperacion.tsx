import { useContext } from "react";
import { OperacionContextProps } from "./OperacionTypes";
import { OperacionContext } from "./OperacionContext";

export const useOperacion = (): OperacionContextProps => {
  const context = useContext(OperacionContext);
  if (!context) {
    throw new Error('useOperacion debe ser usado dentro de un OperacionProvider');
  }
  return context;
};