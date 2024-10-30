import { useContext } from "react";
import { ArchivosContextProps } from "./archivosTypes";
import { ArchivosContext } from "./ArchivosContext";

export const useArchivos = (): ArchivosContextProps => {
  const context = useContext(ArchivosContext);
  if (!context) {
    throw new Error('useArchivos debe ser usado dentro de un ArchivosProvider');
  }
  return context;
};