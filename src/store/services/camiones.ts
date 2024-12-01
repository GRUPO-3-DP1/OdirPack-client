import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { Camion } from '../types/Camion';

async function getCamiones(): Promise<Camion[]> {
  try {
    const response = await axios.get(`${ServicesProperties.BaseUrl}/camion/list`, {
      headers: ServicesProperties.Headers,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching camiones:', error);
    throw new Error('Error al obtener la lista de camiones');
  }
}

async function crearCamion(camionData: { placa: string; fechaLibre: string; almacenId: string | null; tipo: string; capacidad: number; }): Promise<Camion> {
  try {
    const response = await axios.post(`${ServicesProperties.BaseUrl}/camion/create`, camionData, {
      headers: ServicesProperties.Headers,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creando el camión:', error);
    throw new Error('Error al crear el camión');
  }
}

export { getCamiones, crearCamion };