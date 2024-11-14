import React from 'react';
import styles from './page.module.css';
//import BaseMap from '../../components/Mapa/components/Mapa/MapaGeneral/BaseMap';
//import Mapa from '../../components/Mapa/components/Mapa/MapaGoogleMaps/Mapa';
//import { MapMarkersProvider } from '../../context/MapMarker/MapMarkerContext';

const Page: React.FC = () => {
  
  //const{ pedidos }=useOperacion();

  return (
    <div className={styles.contenedor}>
      {/*<MapMarkersProvider>
        <Mapa alwaysShowInfoPanel={true} operationType='diaadia'/>
      </MapMarkersProvider*/}
    </div>
  );
};

export default Page;