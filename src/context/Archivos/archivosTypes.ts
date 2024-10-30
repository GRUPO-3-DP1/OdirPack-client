export type Archivo = {
  id: string;
  name: string;
  size: number;
  type: string;
  content: File;
};

export type ArchivosContextProps = {
  archivos: Archivo[];
  subirArchivo: (file: File) => void;
  limpiarArchivos: () => void;
  eliminarArchivo: (id: string) => void;
};