export interface Archivo {
  id: number;
  nombre: string;
  tipoArchivo: string;
  contenido: string;  // Puede ser un string codificado en base64
  fechaCreacion: number[];  // Fecha en formato array [año, mes, día, hora, minuto, segundo, milisegundos]
}
