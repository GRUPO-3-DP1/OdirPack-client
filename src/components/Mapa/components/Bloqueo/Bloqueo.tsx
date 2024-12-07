import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import React, { useEffect } from 'react';

type Coordinates = {
  lat: number;
  lng: number;
};

type BloqueoProps = {
  inicio: Coordinates;
  fin: Coordinates;
};

const Bloqueo: React.FC<BloqueoProps> = ({ inicio, fin }) => {
  const map = useMap();
  const maps = useMapsLibrary("maps");

  useEffect(() => {
    if (!maps) return;

    const path = new maps.Polyline({
      path: [inicio, fin],
      geodesic: false,
      strokeColor: "#1414b8",
      strokeOpacity: 1.0,
      strokeWeight: 1.0,
    });

    path.setMap(map);

    return () => {
      path.setMap(null);
    };
  }, [inicio, fin, map, maps]);

  return null;
};

export default Bloqueo;