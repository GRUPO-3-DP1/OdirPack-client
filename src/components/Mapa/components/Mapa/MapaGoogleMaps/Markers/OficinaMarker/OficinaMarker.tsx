// OficinaMarker.tsx
import React from 'react';
import { AdvancedMarker, AdvancedMarkerProps } from '@vis.gl/react-google-maps';
import { Store } from '@mui/icons-material';
import styles from './OficinaMarker.module.css';
import { Oficina } from '../../../../../../../context/Simulacion/simulationTypes'; 

interface OficinaMarkerProps extends Omit<AdvancedMarkerProps, 'position'> {
  oficina: Oficina;
  onClick?: (event: any) => void;
}

const OficinaMarker: React.FC<OficinaMarkerProps> = ({ oficina, onClick, ...markerProps }) => {
  return (
    <AdvancedMarker
      position={{ lat: oficina.latitud, lng: oficina.longitud }}
      onClick={onClick}
      {...markerProps}
    >
      <Store className={styles.oficina} fontSize="small" />
    </AdvancedMarker>
  );
};

export default OficinaMarker;