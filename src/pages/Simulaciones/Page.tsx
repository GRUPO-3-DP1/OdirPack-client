import React from 'react';
import styles from './page.module.css';
import Mapa from '../../components/Mapa/Mapa';
import { useSimulation} from '../../context/Simulacion/useSimulation';

const Page: React.FC = () => {
  const {state} = useSimulation();
  return (
    <div className={styles.contenedor}>
      <Mapa />
      {state.ends && (
        <div className={styles.overlay}>
          <p>La simulación ha terminado</p>
        </div>
      )}
    </div>
  );
};

export default Page;