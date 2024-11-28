import React from 'react';
import { AdvancedMarker, AdvancedMarkerProps } from '@vis.gl/react-google-maps';
import styles from './CamionMarker.module.css';
import { Vehicle } from '../../../../../../../context/Simulacion/simulationTypes';
import Ruta from '../../../../Ruta/Ruta';
import CamionIcon from './CamionIcon/CamionIcon';
import { calculateRotation } from '../../../../../../../utils/calculateRotation';
import { BuildCircle } from '@mui/icons-material';

type CamionMarkerProps = Omit<AdvancedMarkerProps, 'position'> & {
  camion: Vehicle;
  ocupacion?: 'baja' | 'media' | 'alta';
  showRoute?: boolean;
};

const CamionMarker: React.FC<CamionMarkerProps> = ({ camion, ocupacion = 'alta', showRoute = true, ...markerProps }) => {
  if (camion.position.currentSegmentIndex == -1) return null;

  const espacio = {
    baja: '#34A853',
    media: '#FBBC05',
    alta: '#EA4335',
  }[ocupacion];

  const rotation =
    camion.currentRoute?.origin && camion.currentRoute?.destination
      ? calculateRotation(camion.currentRoute.origin, camion.currentRoute.destination)
      : 0;

  console.log(camion);

  return (
    <>
      <AdvancedMarker
        {...markerProps}
        position={{ lat: camion.position.lat, lng: camion.position.lng }}
      >
        <div
          className={styles.iconWrapper}
        >
          {camion.averia?.isAveria ? (
            // Ícono de camión averiado
            <BuildCircle
              sx={{
                color: 'red', // Rojo para representar avería
                fontSize: '32px', // Tamaño ajustable
                transform: `rotate(${rotation}deg)`,
              }}
            />
          ) : (
            // Ícono estándar para camión sin avería
            <CamionIcon
              mainColor={espacio}
              size="large"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          )}
        </div>
      </AdvancedMarker>
      {showRoute && camion.currentRoute?.origin && camion.currentRoute?.destination && (
        <Ruta inicio={camion.currentRoute.origin} fin={camion.currentRoute.destination} />
      )}
    </>
  );
};

export default CamionMarker;