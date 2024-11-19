import React from 'react';
import MapaGoogleMaps from '../MapaGoogleMaps/Mapa';
import { MapMarkersProvider } from '../../../../../context/MapMarker/MapMarkerContext';

const BaseMap: React.FC = () => {
  return (
    <>
      <MapMarkersProvider>
        <MapaGoogleMaps />
      </MapMarkersProvider>
    </>
  );
};

export default BaseMap;