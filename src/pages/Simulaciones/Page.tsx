import React, { useEffect } from 'react';
import styles from './page.module.css';
import BaseMap from '../../components/Mapa/components/Mapa/MapaGeneral/BaseMap';

const Page: React.FC = () => {
  useEffect(() => {
    console.log('Simulaciones Page component mounted');
  });
  return (
    <div className={styles.contenedor}>
      <BaseMap operationType='semanal' />
    </div>
  );
};

export default Page;