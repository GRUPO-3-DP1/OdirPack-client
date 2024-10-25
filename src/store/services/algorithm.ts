import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { ResponseAlgorithm } from '../types/AlgorithmResponse'; // Asegúrate de importar el tipo de respuesta adecuado

export type PedidoInput = {
  idPedido: string;
  fechaRegistro: string;
  ubigeoDestino: string;
  cantidad: string;
  idCliente: string;
};

export type VehiculoInput = {
  idVehiculo: string;
  capacidadCarga: number;
  almacenOrigen: string;
};

export type BloqueoInput = {
  fechaInicio: string;
  fechaFin: string;
  ubigeoOrigen: string;
  ubigeoDestino: string;
};

export type PlanificacionInput = {
  pedidos: PedidoInput[];
  vehiculos: VehiculoInput[];
  bloqueos: BloqueoInput[];
  fechaInicio: string;
};

async function enviarPlanificacion(data: PlanificacionInput): Promise<ResponseAlgorithm> {
  try {
    const response = await axios.post(`${ServicesProperties.BaseUrl}/algoritmoTabu`, data, {
      headers: ServicesProperties.Headers,
    });
    console.log('Respuesta del algoritmo:', response.data.data); // Imprime la respuesta en la consola
    return response.data.data; 
  } catch (error) {
    console.error('Error al enviar la planificación:', error);
    throw new Error('Error al enviar la planificación');
  }
}

export { enviarPlanificacion };
