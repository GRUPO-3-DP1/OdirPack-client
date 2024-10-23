import { useState } from 'react';
import { getUbigeos } from '../services/ubigeo';
import { Ubigeo } from '../types/Ubigeo';

type UbigeoHooksReturn = {
    ubigeos: Ubigeo[];
    loading: boolean;
    error: any;
    fetchUbigeos: () => Promise<void>;
};

function useUbigeos(): UbigeoHooksReturn {
    const [ubigeos, setUbigeos] = useState<Ubigeo[]>([]);
    const [loading, setLoading] = useState<boolean>(false); // Inicialmente no está cargando
    const [error, setError] = useState<any>(null);

    const fetchUbigeos = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getUbigeos();
            setUbigeos(data); 
        } catch (err) {
            setError("Error en useUbigeos: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return { ubigeos, loading, error, fetchUbigeos };
}

export default useUbigeos;
