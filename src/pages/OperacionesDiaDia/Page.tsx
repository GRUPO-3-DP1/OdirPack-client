import React from 'react';
import styles from './page.module.css';
import BaseMap from '../../components/Mapa/components/Mapa/MapaGeneral/BaseMap';

const Page: React.FC = () => {
  return (
    <div className={styles.contenedor}>
      <BaseMap operationType="diaadia" />
    </div>
  );
};

export default Page;