import { Bloqueo } from "../../data/bloqueos";

export type Archivo = {
  id: string;
  name: string;
  size: number;
  type: string;
  content: File;
};

export type ArchivosContextProps = {
  archivos: Archivo[];
  bloqueos: { [mes: string]: Bloqueo[]; } | undefined;
  subirArchivo: (file: File) => void;
  limpiarArchivos: () => void;
  eliminarArchivo: (id: string) => void;
};