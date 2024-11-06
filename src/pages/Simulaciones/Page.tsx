import React from 'react';
import styles from './page.module.css';
import Mapa from '../../components/Mapa/components/Mapa/MapaGoogleMaps/Mapa';

const Page: React.FC = () => {
  return (
    <div className={styles.contenedor}>
      <Mapa />
    </div>
  );
};

export default Page;