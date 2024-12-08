import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { Archivo } from '../types/Archivo';
import { PedidosSimulacion } from '../types/PedidosSimulacion';
import { Mes, MesReal } from '../types/Mes';
import { BloqueosSimulacion } from '../types/BloqueosSimulacion';

// Función para subir un archivo
async function subirArchivo(mes: Mes | MesReal, file: File): Promise<Archivo> {
  try {
    // Crear un FormData para enviar el archivo
    const formData = new FormData();
    formData.append('file', file);

    // Determinar si el mes pertenece a MesReal
    const isMesReal = Object.values(MesReal).includes(mes as MesReal);

    // Determinar la URL en función del tipo de mes
    const url = isMesReal
      ? `${ServicesProperties.BaseUrl}/bloqueos-simulacion/${mes}`
      : `${ServicesProperties.BaseUrl}/pedidos-simulacion/${mes}`;

    // Hacer la petición PUT al endpoint de la API
    const response = await axios.put(
      url,
      formData,
      {
        headers: {
          ...ServicesProperties.Headers,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error subiendo el archivo:', error);
    throw new Error('Error al subir el archivo');
  }
}

// Función para eliminar un archivo por mes
async function eliminarArchivo(mes: Mes | MesReal): Promise<void> {
  try {
    // Determinar si el mes pertenece a MesReal
    const isMesReal = Object.values(MesReal).includes(mes as MesReal);

    // Determinar la URL en función del tipo de mes
    const url = isMesReal
      ? `${ServicesProperties.BaseUrl}/bloqueos-simulacion/${mes}`
      : `${ServicesProperties.BaseUrl}/pedidos-simulacion/${mes}`;

    await axios.delete(
      url,
      {
        headers: ServicesProperties.Headers,
      }
    );
  } catch (error) {
    console.error('Error eliminando el archivo:', error);
    throw new Error('Error al eliminar el archivo');
  }
}

// Función para obtener la simulación
async function obtenerPedidos(): Promise<PedidosSimulacion> {
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

async function obtenerBloqueos(): Promise<BloqueosSimulacion> {
  try {
    const response = await axios.get(`${ServicesProperties.BaseUrl}/bloqueos-simulacion`, {
      headers: ServicesProperties.Headers,
    });

    return response.data;
  } catch (error) {
    console.error('Error obteniendo los bloqueos simulación:', error);
    throw new Error('Error al obtener los bloqueos simulación');
  }
}

export { subirArchivo, eliminarArchivo, obtenerPedidos, obtenerBloqueos };
