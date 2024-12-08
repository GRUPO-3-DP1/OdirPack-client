import { useState, useCallback } from 'react';
import { subirArchivo, eliminarArchivo, obtenerBloqueos } from '../services/archivos';
import { Archivo } from '../types/Archivo';
import { MesReal } from '../types/Mes';
import { BloqueosSimulacion } from '../types/BloqueosSimulacion';

type UseBloqueosSimulacionReturn = {
  bloqueosSimulacion: BloqueosSimulacion;
  loading: boolean;
  error: string | null;
  fetchBloqueosSimulacion: () => Promise<void>;
  uploadFile: (mes: MesReal, file: File) => Promise<void>;
  deleteFile: (mes: MesReal) => Promise<void>;
};

function useBloqueosSimulacion(): UseBloqueosSimulacionReturn {
  const [bloqueosSimulacion, setBloqueosSimulacion] = useState<BloqueosSimulacion>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch simulación (archivos por mes)
  const fetchBloqueosSimulacion = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data: BloqueosSimulacion = await obtenerBloqueos();

      // Verifica que 'data' tiene la estructura correcta
      if (data && typeof data === 'object') {
        const simulacionData: BloqueosSimulacion = Object.entries(data).reduce(
          (acc, [mes, archivo]) => ({
            ...acc,
            [mes]: archivo ? mapToArchivo(archivo as Archivo) : null,
          }),
          {}
        );

        setBloqueosSimulacion(simulacionData);
      } else {
        throw new Error('Respuesta de simulación no válida');
      }
    } catch (err) {
      setError(`Failed to fetch simulacion: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para mapear el archivo
  const mapToArchivo = (archivoData: Archivo): Archivo => ({
    id: archivoData.id,
    nombre: archivoData.nombre,
    tipoArchivo: archivoData.tipoArchivo,
    contenido: archivoData.contenido,
    fechaCreacion: archivoData.fechaCreacion,
  });

  // Subir archivo
  const uploadFile = useCallback(async (mes: MesReal, file: File) => {
    setLoading(true);
    setError(null);
    try {
      const archivo = await subirArchivo(mes, file);
      setBloqueosSimulacion((prevSimulacion) => ({
        ...prevSimulacion,
        [mes]: archivo,
      }));
    } catch (err) {
      setError(`Failed to upload file: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar archivo
  const deleteFile = useCallback(async (mes: MesReal) => {
    setLoading(true);
    setError(null);
    try {
      await eliminarArchivo(mes);
      setBloqueosSimulacion((prevSimulacion) => ({
        ...prevSimulacion,
        [mes]: null,
      }));
    } catch (err) {
      setError(`Failed to delete file: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bloqueosSimulacion,
    loading,
    error,
    fetchBloqueosSimulacion,
    uploadFile,
    deleteFile,
  };
}

export default useBloqueosSimulacion;
