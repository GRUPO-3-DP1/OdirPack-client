import React from 'react';
import { ColorScheme, Map, MapMouseEvent } from '@vis.gl/react-google-maps';
import styles from './Mapa.module.css';

interface MapaProps {
  children?: React.ReactNode;
  onClick?: (event: MapMouseEvent) => void;
}


const Mapa: React.FC<MapaProps> = ({ children, onClick }) => {
  return (
    <Map
      className={styles.mapa}
      defaultCenter={{ lat: -11.566435, lng: -75.044072 }}
      defaultZoom={8}
      gestureHandling="greedy"
      disableDefaultUI
      keyboardShortcuts={false}
      colorScheme={ColorScheme.LIGHT}
      mapId="49ae42fed52588c3"
      mapTypeId="roadmap"
      onClick={onClick}
    >
      {children}
    </Map>
  );
};

export default Mapa;
