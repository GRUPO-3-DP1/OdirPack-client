import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { Pedido } from '../types/Pedido';

async function getPedidos(): Promise<Pedido[]> {
  try {
    const response = await axios.get(`${ServicesProperties.BaseUrl}/pedido/list`, {
      headers: ServicesProperties.Headers
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching pedidos:', error);
    throw new Error('Error al obtener la lista de pedidos');
  }
}

export { getPedidos };