// src/services/averia.ts

import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { Averia } from '../types/Averia';

async function createAveria(averiaData: Averia): Promise<void> {
    try {
        await axios.post(`${ServicesProperties.BaseUrl}/averia/create`, averiaData, {
            headers: ServicesProperties.Headers
        });
    } catch (error) {
        console.error('Error creating averia:', error);
        throw new Error('Error al registrar la avería');
    }
}

export { createAveria };
