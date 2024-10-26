import React from 'react';
import { AdvancedMarker, AdvancedMarkerProps } from '@vis.gl/react-google-maps';
import { LocalShipping } from '@mui/icons-material';
import styles from './CamionMarker.module.css';
import { Vehicle } from '../../../context/Simulacion/simulationTypes';

interface CamionMarkerProps extends AdvancedMarkerProps {
  camion?: Vehicle;
}

const CamionMarker: React.FC<CamionMarkerProps> = ({ ...markerProps }) => {
  return (
    <>
      <AdvancedMarker
        {...markerProps}
      >
        <LocalShipping className={styles.camion} />
      </AdvancedMarker>
    </>
  );
};

export default CamionMarker;