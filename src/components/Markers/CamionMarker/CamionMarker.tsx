import React from 'react';
import { AdvancedMarker, AdvancedMarkerProps } from '@vis.gl/react-google-maps';
import { LocalShipping } from '@mui/icons-material';

type Camion = {
  id: string;
  latitud: number;
  longitud: number;
  almacen: number;
};

interface CamionMarkerProps extends Omit<AdvancedMarkerProps, 'position'> {
  camion: Camion;
}

const CamionMarker: React.FC<CamionMarkerProps> = ({ camion, ...markerProps }) => {
  return (
    <AdvancedMarker
      position={{ lat: camion.latitud, lng: camion.longitud }}
      {...markerProps}
    >
      <LocalShipping />
    </AdvancedMarker>
  );
};

export default CamionMarker;