import { useState, useCallback } from 'react';
import { subirArchivo, eliminarArchivo, obtenerPedidos } from '../services/archivos';
import { Archivo } from '../types/Archivo';
import { Mes } from '../types/Mes';
import { PedidosSimulacion } from '../types/PedidosSimulacion';

type UsePedidosSimulacionReturn = {
  pedidosSimulacion: PedidosSimulacion;
  loading: boolean;
  error: string | null;
  fetchPedidosSimulacion: () => Promise<void>;
  uploadFile: (mes: Mes, file: File) => Promise<void>;
  deleteFile: (mes: Mes) => Promise<void>;
};

function usePedidosSimulacion(): UsePedidosSimulacionReturn {
  const [pedidosSimulacion, setPedidosSimulacion] = useState<PedidosSimulacion>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch simulación (archivos por mes)
  const fetchPedidosSimulacion = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data: PedidosSimulacion = await obtenerPedidos();

      // Verifica que 'data' tiene la estructura correcta
      if (data && typeof data === 'object') {
        const simulacionData: PedidosSimulacion = Object.entries(data).reduce(
          (acc, [mes, archivo]) => ({
            ...acc,
            [mes]: archivo ? mapToArchivo(archivo as Archivo) : null,
          }),
          {}
        );

        setPedidosSimulacion(simulacionData);
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
  const uploadFile = useCallback(async (mes: Mes, file: File) => {
    setLoading(true);
    setError(null);
    try {
      const archivo = await subirArchivo(mes, file);
      setPedidosSimulacion((prevSimulacion) => ({
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
  const deleteFile = useCallback(async (mes: Mes) => {
    setLoading(true);
    setError(null);
    try {
      await eliminarArchivo(mes);
      setPedidosSimulacion((prevSimulacion) => ({
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
    pedidosSimulacion,
    loading,
    error,
    fetchPedidosSimulacion,
    uploadFile,
    deleteFile,
  };
}

export default usePedidosSimulacion;
