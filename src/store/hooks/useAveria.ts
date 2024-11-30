// src/hooks/useAveria.ts

import { useState } from 'react';
import { createAveria } from '../services/averia';
import { Averia } from '../types/Averia';

type AveriaHooksReturn = {
    registerAveria: (averia: Averia) => Promise<void>;
    loading: boolean;
    error: any;
};

function useAveria(): AveriaHooksReturn {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    const registerAveria = async (averia: Averia) => {
        setLoading(true);
        setError(null);
        try {
            const response = await createAveria(averia);
            if (response.status >= 400) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
              }
              setLoading(false);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
              } else {
                setError("Error desconocido al registerAveria");
              }
        } finally {
            setLoading(false);
        }
    };

    return { registerAveria, loading, error };
}

export default useAveria;
