import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { Mes } from '../types/Mes';
import { Archivo } from '../types/Archivo';
import { PedidosSimulacion } from '../types/PedidosSimulacion';

// Función para subir un archivo
async function subirArchivo(mes: Mes, file: File): Promise<Archivo> {
  try {
    // Crear un FormData para enviar el archivo
    const formData = new FormData();
    formData.append('file', file);

    // Hacer la petición PUT al endpoint de la API para registrar un archivo en un mes específico
    const response = await axios.put(
      `${ServicesProperties.BaseUrl}/pedidos-simulacion/${mes}`,
      formData,
      {
        headers: {
          ...ServicesProperties.Headers,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error subiendo el archivo:', error);
    throw new Error('Error al subir el archivo');
  }
}

// Función para eliminar un archivo por mes
async function eliminarArchivo(mes: Mes): Promise<void> {
  try {
    // Hacer la petición DELETE al endpoint de la API para eliminar el archivo de un mes específico
    await axios.delete(
      `${ServicesProperties.BaseUrl}/pedidos-simulacion/${mes}`,
      {
        headers: ServicesProperties.Headers,
      }
    );
  } catch (error) {
    console.error('Error eliminando el archivo:', error);
    throw new Error('Error al eliminar el archivo');
  }
}

// Función para obtener la simulación (los archivos de cada mes)
async function obtenerSimulacion(): Promise<PedidosSimulacion> {
  try {
    const response = await axios.get(`${ServicesProperties.BaseUrl}/pedidos-simulacion`, {
      headers: ServicesProperties.Headers,
    });

    return response.data;
  } catch (error) {
    console.error('Error obteniendo la simulación:', error);
    throw new Error('Error al obtener la simulación');
  }
}

export { subirArchivo, eliminarArchivo, obtenerSimulacion };