import React from 'react';
import { AdvancedMarker, AdvancedMarkerProps } from '@vis.gl/react-google-maps';
import { Store } from '@mui/icons-material';
import styles from './OficinaMarker.module.css';

type Oficina = {
  ubigeo: string;
  departamento: string;
  provincia: string;
  latitud: number;
  longitud: number;
  regionNatural: string;
  almacen: number;
};

interface OficinaMarkerProps extends Omit<AdvancedMarkerProps, 'position'> {
  oficina: Oficina;
}

const OficinaMarker: React.FC<OficinaMarkerProps> = ({ oficina, ...markerProps }) => {
  return (
    <AdvancedMarker
      position={{ lat: oficina.latitud, lng: oficina.longitud }}
      {...markerProps}
    >
      <Store className={styles.oficina} fontSize='small' />
    </AdvancedMarker>
  );
};

export default OficinaMarker;