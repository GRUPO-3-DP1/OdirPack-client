import { useContext } from "react";
import { OperacionContext } from "./OperacionContext";

export const useOperacion = () => {
  const context = useContext(OperacionContext);
  if (!context) {
    throw new Error("useOperacion solo se puede usar dentro de OperacionProvider");
  }
  return context;
};