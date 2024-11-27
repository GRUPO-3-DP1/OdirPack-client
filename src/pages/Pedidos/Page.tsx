import React, { useEffect } from 'react';
import usePedidos from '../../store/hooks/usePedidos';
import styles from './page.module.css';
import CamionIcon from '../../components/Mapa/components/Mapa/MapaGoogleMaps/Markers/CamionMarker/CamionIcon/CamionIcon';
import { House } from '@mui/icons-material';

const Page: React.FC = () => {
  const { pedidos, loading, error, fetchPedidos } = usePedidos();

  useEffect(() => {
    fetchPedidos();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.contenedor}>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.pedidoId}>
              <td>{pedido.pedidoId}</td>
              <td>{pedido.origenId}</td>
              <td>{pedido.destinoId}</td>
              <td>{pedido.cantidadTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <CamionIcon />
      <House />
      <House fontSize='small' />
      <House fontSize='large' />
    </div>
  );
};

export default Page;