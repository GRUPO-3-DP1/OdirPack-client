import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { Ubigeo } from '../types/Ubigeo';

async function getUbigeos(): Promise<Ubigeo[]> {
    try {
        const response = await axios.get(`${ServicesProperties.BaseUrl}/ubigeo/list`, {
            headers: ServicesProperties.Headers
        });
        return response.data.data; 
    } catch (error) {
        console.error('Error fetching ubigeos:', error);
        throw new Error('Error al obtener la lista de ubigeos');
    }
}

export { getUbigeos };