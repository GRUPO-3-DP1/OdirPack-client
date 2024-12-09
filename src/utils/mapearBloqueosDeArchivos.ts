import dayjs from 'dayjs';
import { BloqueosSimulacion } from '../store/types/BloqueosSimulacion';
import { ubigeos } from '../data/ubigeos';

export type Bloqueo = {
  idBloqueo: string;
  origen: { lat: number; lng: number; };
  destino: { lat: number; lng: number; };
  fechaInicio: Date;
  fechaFin: Date;
  ubigeoOrigen: string;
  ubigeoDestino: string;
};

export const mapearBloqueosDesdeArchivos = (
  simulacion: BloqueosSimulacion,
  fechaInicio: Date,
  fechaFin: Date
): Bloqueo[] => {
  let idBloqueoCounter = 0; // Contador global para los IDs de bloqueo
  const bloqueos: Bloqueo[] = [];

  console.log({ fechaInicio, fechaFin });

  // Iterar sobre los meses en la simulación
  Object.keys(simulacion).forEach((mes) => {
    const archivo = simulacion[mes as keyof BloqueosSimulacion];

    if (archivo && archivo.contenido) {
      const { contenido } = archivo;
      // Decodificar el contenido Base64 a texto
      const contenidoDecodificado = atob(contenido);
      // Dividir el contenido en líneas
      const lineas = contenidoDecodificado.split('\n').map(linea => linea.trim());

      lineas.forEach((linea) => {
        const regex = /^(\d{6})\s*=>\s*(\d{6});(\d{4},\d{2}:\d{2})==(\d{4},\d{2}:\d{2})$/;
        const match = linea.match(regex);
        if (match) {
          const [, origen, destino, inicio, fin] = match;

          const [diaInicio, horaInicio] = inicio.split(',');
          const [diaFin, horaFin] = fin.split(',');

          // Crear las fechas usando dayjs para manejar correctamente las fechas
          const fechaInicioBloqueo = dayjs()
            .set('date', parseInt(diaInicio.substring(2, 4), 10))
            .set('month', parseInt(diaInicio.substring(0, 2), 10) - 1)
            .set('hour', parseInt(horaInicio.split(':')[0], 10))
            .set('minute', parseInt(horaInicio.split(':')[1], 10))
            .toDate();

          const fechaFinBloqueo = dayjs()
            .set('date', parseInt(diaFin.substring(2, 4), 10))
            .set('month', parseInt(diaFin.substring(0, 2), 10) - 1)
            .set('hour', parseInt(horaFin.split(':')[0], 10))
            .set('minute', parseInt(horaFin.split(':')[1], 10))
            .toDate();

          //console.log({ match, fechaInicioBloqueo, fechaFinBloqueo });

          // Filtrar por rango de fechas
          if (
            (fechaInicioBloqueo >= fechaInicio && fechaFinBloqueo <= fechaFin)
            || (fechaFinBloqueo >= fechaInicio && fechaFinBloqueo <= fechaFin)
            || (fechaInicioBloqueo >= fechaInicio && fechaInicioBloqueo <= fechaFin)
          ) {
            const origenCoords = ubigeos.get(origen);
            const destinoCoords = ubigeos.get(destino);

            if (origenCoords && destinoCoords) {
              const idBloqueo = `BLQ-${String(++idBloqueoCounter).padStart(4, '0')}`;

              const bloqueo: Bloqueo = {
                idBloqueo,
                origen: { lat: origenCoords.latitud, lng: origenCoords.longitud },
                destino: { lat: destinoCoords.latitud, lng: destinoCoords.longitud },
                fechaInicio: fechaInicioBloqueo,
                fechaFin: fechaFinBloqueo,
                ubigeoOrigen: origen,
                ubigeoDestino: destino,
              };

              bloqueos.push(bloqueo);
            } else {
              console.log(`Ubigeo no encontrado: ${origen} o ${destino}`);
            }
          }
        } else {
          //console.log("Línea no coincide con el formato esperado:", linea);
        }
      });
    }
  });

  return bloqueos;
};

export const mapBloqueosAsync = async (
  simulacion: BloqueosSimulacion,
  fechaInicio: Date,
  fechaFin: Date
): Promise<Bloqueo[]> => {
  // Wrap the synchronous mapping in a Promise to make it async
  return new Promise((resolve) => {
    // Use setTimeout to allow UI to update and prevent blocking
    setTimeout(() => {
      const mappedBloqueos = mapearBloqueosDesdeArchivos(
        simulacion,
        fechaInicio,
        fechaFin
      );
      resolve(mappedBloqueos);
    }, 0);
  });
};