import React from 'react';
import { AdvancedMarker, AdvancedMarkerProps } from '@vis.gl/react-google-maps';
import { LocalShipping } from '@mui/icons-material';
import styles from './CamionMarker.module.css';
import { Vehicle } from '../../../context/Simulacion/simulationTypes';

type CamionMarkerProps = Omit<AdvancedMarkerProps, 'position'> & {
  camion: Vehicle;
};

const CamionMarker: React.FC<CamionMarkerProps> = ({ camion, ...markerProps }) => {
  return (
    <>
      {
        camion.position.currentSegmentIndex !== -1 &&
        <AdvancedMarker
          {...markerProps}
          position={{ lat: camion.position.lat, lng: camion.position.lng }}
        >
          <LocalShipping className={styles.camion} />
        </AdvancedMarker>
      }
    </>
  );
};

export default CamionMarker;