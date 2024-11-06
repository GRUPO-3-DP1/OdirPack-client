import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import React, { useEffect } from 'react';

type Coordinates = {
  lat: number;
  lng: number;
};

type RutaProps = {
  inicio: Coordinates;
  fin: Coordinates;
};

const Ruta: React.FC<RutaProps> = ({ inicio, fin }) => {
  const map = useMap();
  const maps = useMapsLibrary("maps");

  useEffect(() => {
    if (!maps) return;

    const path = new maps.Polyline({
      path: [inicio, fin],
      geodesic: false,
      strokeColor: "#9b9b9b",
      strokeOpacity: 1.0,
      strokeWeight: 0.2,
    });

    path.setMap(map);

    return () => {
      path.setMap(null);
    };
  }, [inicio, fin, map, maps]);

  return null;
};

export default Ruta;