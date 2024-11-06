import React from 'react';
import MapaGoogleMaps from '../MapaGoogleMaps/Mapa';
import MapaLeaflet from '../MapaLeaflet/Mapa';
import { MapMarkersProvider } from '../../../../../context/MapMarker/MapMarkerContext';

const BaseMap: React.FC = () => {
  const isGoogleMaps = true;
  return (
    <MapMarkersProvider>
      {isGoogleMaps ?
        <MapaGoogleMaps />
        :
        <MapaLeaflet />
      }
    </MapMarkersProvider>
  );
};

export default BaseMap;