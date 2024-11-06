import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import React from 'react';

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

  if (!maps) {
    return null;
  }

  const flightPath = new maps.Polyline({
    path: [inicio, fin],
    geodesic: false,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 0.2,
  });

  flightPath.setMap(map);

  return null;
};

export default Bloqueo;