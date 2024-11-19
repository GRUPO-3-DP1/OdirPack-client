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
            await createAveria(averia);
        } catch (err) {
            setError("Error al registrar avería: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return { registerAveria, loading, error };
}

export default useAveria;
