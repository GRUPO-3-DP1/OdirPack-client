// oficinas.ts
import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';

export interface OficinaData {
  almacen: number;
  cargaPorcentaje: number;
  cantidadPaquetes: number;
  capacidadTotal: number;
  paquetesRecibidos: number;
}

export const obtenerDatosOficina = async (almacenId: number): Promise<OficinaData> => {
  try {
    const response = await axios.get(
      `${ServicesProperties.BaseUrl}/oficinas/${almacenId}`,
      { headers: ServicesProperties.Headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener los datos de la oficina:', error);
    throw error;
  }
};
