import React, { useEffect } from 'react';
import styles from './page.module.css';
import usePedidos from '../../store/hooks/usePedidos';
import useUbigeos from '../../store/hooks/useUbigeos';
import useAlgorithm from '../../store/hooks/useAlgorithm';
import { Button } from '@mui/material';

const Page: React.FC = () => {

  const { fetchPedidos, pedidos } = usePedidos();

  const { fetchUbigeos, ubigeos } = useUbigeos();

  const { sendPlanificacion, loading: loadingPlanificacion, error: errorPlanificacion, response: responsePlanificacion } = useAlgorithm();

  useEffect(() => {
    fetchPedidos();
    fetchUbigeos();
  }, []);

  // Manejar el clic en el botón
  const handleListarPedidos = async () => {
    try {
      console.log("Pedidos recuperados:", pedidos); // Imprime los pedidos en la consola
    } catch (err) {
      console.error("Error al listar los pedidos:", err);
    }
  };

  // Manejar el clic en el botón
  const handleListarUbigeos = async () => {
    try {
      console.log("Ubigeos recuperados:", ubigeos); // Imprime los pedidos en la consola
    } catch (err) {
      console.error("Error al listar los ubigeos:", err);
    }
  };

  // Manejar el clic en el botón para enviar la planificación
  const handleEnviarPlanificacion = async () => {
    const planificacionData = {
      pedidos: [
        {
          idPedido: "PED-0001",
          fechaRegistro: "2024-10-21T00:02:00",
          ubigeoDestino: "150801",
          cantidad: "30",
          idCliente: "000707",
        },
        {
          idPedido: "PED-0002",
          fechaRegistro: "2024-10-21T00:00:00",
          ubigeoDestino: "150501",
          cantidad: "67",
          idCliente: "000624",
        },
      ],
      vehiculos: [
        {
          idVehiculo: "V001",
          capacidadCarga: 120,
          almacenOrigen: "150101",
        },
        {
          idVehiculo: "V002",
          capacidadCarga: 120,
          almacenOrigen: "150101",
        },
      ],
      bloqueos: [
        {
          fechaInicio: "2024-10-28T08:00:00",
          fechaFin: "2024-10-28T10:00:00",
          ubigeoOrigen: "001001",
          ubigeoDestino: "051001",
        },
      ],
      fechaInicio: "2024-10-21T10:00:00",
    };

    await sendPlanificacion(planificacionData);
    console.log("Planificación: ", responsePlanificacion);
  };

  return (
    <div>
      <div className={styles.titulo}>Pedidos</div>
      <Button onClick={handleListarPedidos}>
        Listar Pedidos Prueba
      </Button>
      <Button onClick={handleListarUbigeos}>
        Listar Ubigeos Prueba
      </Button>
      <Button onClick={handleEnviarPlanificacion} disabled={loadingPlanificacion}>
        {loadingPlanificacion ? 'Enviando Planificación...' : 'Enviar Planificación'}
      </Button>
      {errorPlanificacion && <p>Error: {errorPlanificacion}</p>}
      {responsePlanificacion && <p>Planificación enviada correctamente.</p>}
    </div>
  );
};

export default Page;