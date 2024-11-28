// src/services/averia.ts

import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { Averia } from '../types/Averia';

async function createAveria(averiaData: Averia): Promise<any> {
    try {
        const response = await axios.post(`${ServicesProperties.BaseUrl}/averia/create`, averiaData, {
            headers: ServicesProperties.Headers
        });
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            return error.response;
          } else {
            throw new Error("Error en createAveria");
          }
    }
}

export { createAveria };
