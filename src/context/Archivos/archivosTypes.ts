import { Bloqueo } from "../../data/bloqueos";
import { TramoMap } from "../../utils/routeParser";

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
  rutas: TramoMap | undefined;
  subirArchivo: (file: File) => void;
  limpiarArchivos: () => void;
  eliminarArchivo: (id: string) => void;
};