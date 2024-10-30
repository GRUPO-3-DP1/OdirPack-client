import { getCoordenadas } from "../utils/getCoordenadasFromUbigeo";

export type Posicion = {
  lat: number;
  lng: number;
};

export type Bloqueo = {
  ugOri: string;
  posicionOrigen: Posicion;
  ugDes: string;
  posicionDestino: Posicion;
  mesInicio: number;
  diaInicio: number;
  horaInicio: number;
  minutoInicio: number;
  mesFin: number;
  diaFin: number;
  horaFin: number;
  minutoFin: number;
};

export function parseBloqueoFile(fileContent: string): Bloqueo[] {
  const bloqueos: Bloqueo[] = [];
  const lines = fileContent.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine === '' || trimmedLine.startsWith('#')) {
      continue;
    }

    const match = trimmedLine.match(/^(\d{6}) => (\d{6});(\d{2}\d{2}),(\d{2}:\d{2})==(\d{2}\d{2}),(\d{2}:\d{2})$/);

    if (match) {
      const [, ugOri, ugDes, mmddInicio, hhmmInicio, mmddFin, hhmmFin] = match;
      const [mmInicio, ddInicio] = [parseInt(mmddInicio.slice(0, 2)), parseInt(mmddInicio.slice(2, 4))];
      const [mmFin, ddFin] = [parseInt(mmddFin.slice(0, 2)), parseInt(mmddFin.slice(2, 4))];
      const [hhInicio, mmInicioTime] = [parseInt(hhmmInicio.slice(0, 2)), parseInt(hhmmInicio.slice(3, 5))];
      const [hhFin, mmFinTime] = [parseInt(hhmmFin.slice(0, 2)), parseInt(hhmmFin.slice(3, 5))];

      bloqueos.push({
        ugOri,
        posicionOrigen: getCoordenadas(ugOri) || { lat: 0, lng: 0 },
        ugDes,
        posicionDestino: getCoordenadas(ugDes) || { lat: 0, lng: 0 },
        mesInicio: mmInicio,
        diaInicio: ddInicio,
        horaInicio: hhInicio,
        minutoInicio: mmInicioTime,
        mesFin: mmFin,
        diaFin: ddFin,
        horaFin: hhFin,
        minutoFin: mmFinTime,
      });
    } else {
      console.warn(`Línea inválida: ${line}`);
    }
  }

  return bloqueos;
}

export function getFechaBloqueo(bloqueo: Bloqueo, year: number): { inicio: Date, fin: Date; } {
  const añoInicio = year;
  let añoFin = year;

  if (bloqueo.mesFin < bloqueo.mesInicio) {
    añoFin = year + 1;
  }

  return {
    inicio: new Date(añoInicio, bloqueo.mesInicio - 1, bloqueo.diaInicio, bloqueo.horaInicio, bloqueo.minutoInicio),
    fin: new Date(añoFin, bloqueo.mesFin - 1, bloqueo.diaFin, bloqueo.horaFin, bloqueo.minutoFin),
  };
}