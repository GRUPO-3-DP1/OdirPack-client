import { useState, useCallback } from 'react';
import { Camion } from '../types/Camion';
import { crearCamion, getCamiones } from '../services/camiones';

export type CamionData = Omit<Camion, 'camionId'>;

type UseCamionesReturn = {
  camiones: Camion[];
  loading: boolean;
  error: string | null;
  fetchCamiones: () => Promise<void>;
  createCamion: (camionData: CamionData) => Promise<void>;
  setCamiones: React.Dispatch<React.SetStateAction<Camion[]>>;
};

function useCamiones(): UseCamionesReturn {
  const [camiones, setCamiones] = useState<Camion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCamiones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCamiones();
      setCamiones(data);
      console.log('Camiones fetched successfully.');
    } catch (err) {
      setError(`Failed to fetch camiones: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCamion = useCallback(async (camionData: CamionData) => {
    setLoading(true);
    setError(null);
    try {
      await crearCamion({ ...camionData, fechaLibre: camionData.fechaLibre ?? '' });
      console.log('Camion created successfully.');
    } catch (err) {
      setError(`Failed to create camion: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return { camiones, loading, error, fetchCamiones, createCamion, setCamiones };
}

export default useCamiones;