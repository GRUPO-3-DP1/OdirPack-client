/*getTruckTransportationPlan.ts*/

import { formatDateAMPM } from './formatDateAMPM';

export interface TruckRow {
  ruta: string;
  camion: string;
  inicio: string;
  fin: string;
  origen: string;
  destino: string;
  averia: boolean;
  estado: string; // "Completado", "Averiado", "En tránsito"
  tramosDetalle?: {
    inicio: string;
    fin: string;
    origen: string;
    destino: string;
    estado: string;
    horaAveria?: string;
  }[];
}

export function getTruckTransportationPlan():{truckData:TruckRow[]} {
  // Ejemplo mock
  const truckData: TruckRow[] = [
    {
      ruta: 'R001',
      camion: 'C001',
      inicio: formatDateAMPM('2024-10-21T06:00:00Z'),
      fin: formatDateAMPM('2024-10-21T10:00:00Z'),
      origen: '12345 - Lima',
      destino: '56789 - Huancayo',
      averia: false,
      estado: 'Completado',
      tramosDetalle:[
        { inicio:formatDateAMPM('2024-10-21T06:00:00Z'), fin:formatDateAMPM('2024-10-21T08:00:00Z'), origen:'Lima', destino:'Huancayo', estado:'Completado' },
        { inicio:formatDateAMPM('2024-10-21T08:00:00Z'), fin:formatDateAMPM('2024-10-21T10:00:00Z'), origen:'Huancayo', destino:'Ayacucho', estado:'Completado' }
      ]
    }
  ];

  return { truckData };
}
