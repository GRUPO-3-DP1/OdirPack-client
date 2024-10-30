import { createContext, useState } from "react";
import { Archivo, ArchivosContextProps } from "./archivosTypes";

export const ArchivosContext = createContext<ArchivosContextProps | undefined>(undefined);

export const ArchivosProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [archivos, setArchivos] = useState<Archivo[]>([]);

  const subirArchivo = (file: File) => {
    const nuevoArchivo: Archivo = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      content: file,
    };
    setArchivos((prevArchivos) => [...prevArchivos, nuevoArchivo]);
  };

  const limpiarArchivos = () => {
    setArchivos([]);
  };

  const eliminarArchivo = (id: string) => {
    setArchivos((prevArchivos) => prevArchivos.filter((archivo) => archivo.id !== id));
  };

  return (
    <ArchivosContext.Provider value={{ archivos, subirArchivo, limpiarArchivos, eliminarArchivo }}>
      {children}
    </ArchivosContext.Provider>
  );
};