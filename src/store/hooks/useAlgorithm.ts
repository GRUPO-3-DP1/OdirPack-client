import { useState } from 'react';
import { enviarPlanificacion } from '../services/algorithm'; // Asegúrate de importar el servicio correcto
import { ResponseAlgorithm } from '../types/AlgorithmResponse'; // Importa el tipo de respuesta esperado

type UseAlgorithmReturn = {
    response: ResponseAlgorithm | null;
    loading: boolean;
    error: string | null;
    sendPlanificacion: (data: any) => Promise<void>; // Ajusta el tipo de data según tus necesidades
};

function useAlgorithm(): UseAlgorithmReturn {
    const [response, setResponse] = useState<ResponseAlgorithm | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const sendPlanificacion = async (data: any) => {
        setLoading(true);
        setError(null);

        try {
            const res = await enviarPlanificacion(data);
            setResponse(res);
        } catch (err) {
            setError("Error en useAlgorithm: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return { response, loading, error, sendPlanificacion };
}

export default useAlgorithm;
