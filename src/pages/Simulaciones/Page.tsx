import React from 'react';
import styles from './page.module.css';
//import Mapa from '../../components/Mapa/components/Mapa/MapaLeaflet/Mapa';
import Mapa from '../../components/Mapa/components/Mapa/MapaGoogleMaps/Mapa';
import BaseMap from '../../components/Mapa/components/Mapa/MapaGeneral/BaseMap';

const Page: React.FC = () => {
  return (
    <div className={styles.contenedor}>
      <BaseMap />
    </div>
  );
};

export default Page;