import React, { useEffect, useState } from 'react';
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
  destino: { latitud: number; longitud: number; };
  duracion: number;
}

const CamionMarker: React.FC<CamionMarkerProps> = ({ camion, destino, duracion, ...markerProps }) => {
  const [position, setPosition] = useState({ lat: camion.latitud, lng: camion.longitud });

  useEffect(() => {
    let animationFrameId: number;
    const startLat = camion.latitud;
    const startLng = camion.longitud;
    const endLat = destino.latitud;
    const endLng = destino.longitud;
    const startTime = performance.now();

    const animateMarker = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duracion, 1);
      const newLat = startLat + (endLat - startLat) * progress;
      const newLng = startLng + (endLng - startLng) * progress;
      setPosition({ lat: newLat, lng: newLng });

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateMarker);
      }
    };

    animationFrameId = requestAnimationFrame(animateMarker);

    return () => cancelAnimationFrame(animationFrameId);
  }, [camion.latitud, camion.longitud, destino.latitud, destino.longitud, duracion]);

  return (
    <AdvancedMarker
      position={position}
      {...markerProps}
    >
      <LocalShipping />
    </AdvancedMarker>
  );
};

export default CamionMarker;