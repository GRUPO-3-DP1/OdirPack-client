import { createContext, useState } from "react";
import { Archivo, ArchivosContextProps } from "./archivosTypes";
import { generarUUID } from "../../utils/generarUUID";
import { Bloqueo, parseBloqueoFile } from "../../data/bloqueos";

export const ArchivosContext = createContext<ArchivosContextProps | undefined>(undefined);

export const ArchivosProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [bloqueos, setBloqueos] = useState<{ [mes: string]: Bloqueo[]; }>();

  const subirArchivo = (file: File) => {
    const nuevoArchivo: Archivo = {
      id: generarUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      content: file,
    };
    // Leer el contenido del archivo y parsear los bloqueos
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        const mes = file.name.slice(-6, -4); // Extraer el mes
        const bloqueosParseados = parseBloqueoFile(e.target.result);

        setBloqueos((prevBloqueos) => {
          const newBloqueos = prevBloqueos ? { ...prevBloqueos } : {};

          newBloqueos[mes] = bloqueosParseados;

          return newBloqueos;
        });
        setArchivos((prevArchivos) => [...prevArchivos, nuevoArchivo]);
      }
    };
    reader.readAsText(file);
  };

  const limpiarArchivos = () => {
    setArchivos([]);
    setBloqueos(undefined);
  };

  const eliminarArchivo = (id: string) => {
    setArchivos((prevArchivos) =>
      prevArchivos.filter((archivo) => archivo.id !== id)
    );

    setBloqueos((prevBloqueos) => {
      if (!prevBloqueos) return undefined; // Nada que eliminar

      const archivoEliminado = archivos.find(archivo => archivo.id === id);
      if (!archivoEliminado) return prevBloqueos; // Archivo no encontrado

      const mes = archivoEliminado.name.slice(-6, -4);

      const newBloqueos = { ...prevBloqueos };
      delete newBloqueos[mes];

      return Object.keys(newBloqueos).length === 0 ? undefined : newBloqueos; // si no hay nada, regresamos undefined
    });
  };

  return (
    <ArchivosContext.Provider value={{ archivos, bloqueos, subirArchivo, limpiarArchivos, eliminarArchivo }}>
      {children}
    </ArchivosContext.Provider>
  );
};