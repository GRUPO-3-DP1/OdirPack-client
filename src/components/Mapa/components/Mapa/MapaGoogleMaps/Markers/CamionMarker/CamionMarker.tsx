import React from 'react';
import { AdvancedMarker, AdvancedMarkerProps } from '@vis.gl/react-google-maps';
import { LocalShipping } from '@mui/icons-material';
import styles from './CamionMarker.module.css';
import { Vehicle } from '../../../../../../../context/Simulacion/simulationTypes';

type CamionMarkerProps = Omit<AdvancedMarkerProps, 'position'> & {
  camion: Vehicle;
};

const CamionMarker: React.FC<CamionMarkerProps> = ({ camion, ...markerProps }) => {
  // Log para ver qué camión está siendo renderizado
  if (camion.position.currentSegmentIndex !== -1) {
    console.log('Renderizando camión:', camion.idVehiculo, 'Posición:', camion.position);
  }
  return (
    <>
      {
        camion.position.currentSegmentIndex !== -1 &&
        <AdvancedMarker
          {...markerProps}
          position={{ lat: camion.position.lat, lng: camion.position.lng }}
        >
          <LocalShipping
            className={styles.camion}
            fontSize="small"
          />
        </AdvancedMarker>
      }
    </>
  );
};

export default CamionMarker;