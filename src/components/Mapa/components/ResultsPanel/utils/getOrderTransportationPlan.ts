/*getOrderTransportationPlan.ts*/

import { formatDateAMPM } from './formatDateAMPM';

export interface OrderRow {
  ruta: string;
  pedido: string;
  inicio: string;
  fin: string;
  origen: string;
  destino: string;
  paquetes: number;
  estado: string; // "Retrasado", "Entregado", "En tránsito"
  tramosDetalle?: {
    inicio: string;
    fin: string;
    origen: string;
    destino: string;
    estado: string;
    camion: string;
  }[];
}

export function getOrderTransportationPlan() : { orderData: OrderRow[] } {
  // Aquí iría la lógica real para extraer la información de solutions
  // Ejemplo mock:
  const orderData: OrderRow[] = [
    {
      ruta:'R100',
      pedido:'PED-001',
      inicio: formatDateAMPM('2024-10-21T05:00:00Z'),
      fin: formatDateAMPM('2024-10-21T09:00:00Z'),
      origen:'11111 - Chiclayo',
      destino:'22222 - Chimbote',
      paquetes:20,
      estado:'En tránsito',
      tramosDetalle:[
        {
          inicio: formatDateAMPM('2024-10-21T05:00:00Z'),
          fin: formatDateAMPM('2024-10-21T07:00:00Z'),
          origen:'Chiclayo',
          destino:'Trujillo',
          estado:'En tránsito',
          camion:'C010'
        },
        {
          inicio: formatDateAMPM('2024-10-21T07:00:00Z'),
          fin: formatDateAMPM('2024-10-21T09:00:00Z'),
          origen:'Trujillo',
          destino:'Chimbote',
          estado:'En tránsito',
          camion:'C010'
        }
      ]
    }
  ];

  return { orderData };
}
