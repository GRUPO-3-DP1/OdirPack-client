import React from 'react';
import styles from './page.module.css';
import Mapa from '../../components/Mapa/Mapa';
import { useSimulation} from '../../context/Simulacion/useSimulation';

const Page: React.FC = () => {
  const {state} = useSimulation();
  return (
    <div className={styles.contenedor}>
      <Mapa />
    </div>
  );
};

export default Page;