import React from 'react';
import styles from './page.module.css';
import Mapa from '../../components/Mapa/Mapa';
import { SimulationProvider } from '../../context/Simulacion/SimulationContext';

const Page: React.FC = () => {
  return (
    <div className={styles.contenedor}>
      <SimulationProvider>
        <Mapa />
      </SimulationProvider>
    </div>
  );
};

export default Page;