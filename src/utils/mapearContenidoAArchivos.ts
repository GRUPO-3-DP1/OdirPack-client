import dayjs from 'dayjs';
import { PedidosSimulacion } from '../store/types/PedidosSimulacion';

interface Pedido {
  idPedido: string;
  fechaRegistro: string;
  ubigeoDestino: string;
  cantidad: string;
  idCliente: string;
}

export const mapearContenidoAArchivos = (
  simulacion: PedidosSimulacion,
  fechaInicio: Date,
  fechaFin: Date
): Pedido[] => {
  let idPedidoCounter = 0; // Contador global para el idPedido
  const pedidos: Pedido[] = [];

  // Iteramos sobre cada mes en la simulación
  Object.keys(simulacion).forEach((mes) => {
    const archivo = simulacion[mes];
    // Si el archivo existe y tiene contenido
    if (archivo && archivo.contenido) {
      const { nombre, contenido } = archivo;
      // Decodificar el contenido Base64 a texto
      const contenidoDecodificado = atob(contenido);
      // Extraemos el año y mes desde el nombre del archivo
      const regexFecha = /ventas(\d{6})\.txt/;
      const matchFecha = nombre.match(regexFecha);
      let anio = 2024; // Año por defecto
      let mesArchivo = 6; // Mes por defecto (junio) si no se extrae el mes
      if (matchFecha) {
        const fecha = matchFecha[1]; // '202408' o '202409'
        anio = parseInt(fecha.substring(0, 4), 10);
        mesArchivo = parseInt(fecha.substring(4, 6), 10);
      }
      // Convertimos el contenido decodificado en un arreglo de líneas
      const lineas = contenidoDecodificado.split('\n').map(linea => linea.trim());
      // Iteramos sobre cada línea para extraer la información de cada pedido
      lineas.forEach((linea) => {
        const regex = /^(\d{2})\s+(\d{2}:\d{2})\s*,\s*(\d{6}|\*{6})\s*=>\s*(\d{6})\s*,\s*(\d+)$/;
        const match = linea.match(regex);
        if (match) {
          const [, dia, hora, , destino, cantidad] = match;
          // Creamos la fecha completa usando el año y mes extraído del nombre del archivo
          const fechaRegistro = dayjs(new Date(
            anio,
            mesArchivo - 1,
            parseInt(dia),
            parseInt(hora.split(':')[0]),
            parseInt(hora.split(':')[1])
          )).format('YYYY-MM-DDTHH:mm:ss');

          // Verificamos si la fecha está dentro del rango especificado
          const fechaRegistroDate = new Date(fechaRegistro);
          if (fechaRegistroDate >= fechaInicio && fechaRegistroDate <= fechaFin) {
            // Generamos un ID de pedido basado en el contador global
            const idPedido = `PED-${String(++idPedidoCounter).padStart(4, '0')}`;
            // Asignamos el ID de cliente como "0"
            const idCliente = "000000";
            // Creamos el pedido
            const pedido: Pedido = {
              idPedido,
              fechaRegistro,
              ubigeoDestino: destino,
              cantidad,
              idCliente,
            };
            // Añadimos el pedido al arreglo
            pedidos.push(pedido);
          }
        } else {
          console.log("No match para la línea:", linea);
        }
      });
    }
  });
  return pedidos;
};