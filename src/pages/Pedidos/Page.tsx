import React, { useEffect } from 'react';
import styles from './page.module.css';
import  usePedidos from '../../store/hooks/usePedidos';
import useUbigeos from '../../store/hooks/useUbigeos';
import { Button } from '@mui/material';

const Page: React.FC = () => {
  
  const { fetchPedidos, pedidos } = usePedidos();

  const { fetchUbigeos, ubigeos } = useUbigeos();

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

  return (
    <div>
      <div className={styles.titulo}>Pedidos</div>
      <Button 
        onClick={handleListarPedidos} // Maneja el clic en el botón
      >
        Listar Pedidos Prueba
      </Button>
      <Button 
        onClick={handleListarUbigeos} // Maneja el clic en el botón
      >
        Listar Ubigeos Prueba
      </Button>
    </div>
  );
};

export default Page;