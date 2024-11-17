// OficinaMarker.tsx
import React from 'react';
import { AdvancedMarker, AdvancedMarkerProps } from '@vis.gl/react-google-maps';
import { Store } from '@mui/icons-material';
import styles from './OficinaMarker.module.css';
import { Oficina } from '../../../../../../../context/Simulacion/simulationTypes';

interface OficinaMarkerProps extends Omit<AdvancedMarkerProps, 'position'> {
  oficina: Oficina;
  ocupacion?: 'baja' | 'media' | 'alta';
  onClick?: (event: google.maps.MapMouseEvent) => void;
}

const OficinaMarker: React.FC<OficinaMarkerProps> = ({ oficina, ocupacion = 'baja', onClick, ...markerProps }) => {

  const color = {
    baja: '#34A853',
    media: '#FBBC05',
    alta: '#EA4335',
  }[ocupacion];

  return (
    <AdvancedMarker
      position={{ lat: oficina.latitud, lng: oficina.longitud }}
      onClick={onClick}
      {...markerProps}
    >
      <div className={styles.iconWrapper} style={
        { border: '2px solid' + color }
      }>
        <Store
          className={styles.storeIcon}
          style={{ color: color }}
          fontSize='small'
        />
      </div>
    </AdvancedMarker>
  );
};

export default OficinaMarker;