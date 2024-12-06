import { Archivo } from './Archivo';

export interface PedidosSimulacion {
  [mes: string]: Archivo | null;
}
