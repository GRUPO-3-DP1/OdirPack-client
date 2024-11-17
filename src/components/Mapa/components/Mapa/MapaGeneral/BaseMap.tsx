import React from 'react';
import MapaGoogleMaps from '../MapaGoogleMaps/Mapa';
import MapaLeaflet from '../MapaLeaflet/Mapa';
import { MapMarkersProvider } from '../../../../../context/MapMarker/MapMarkerContext';

const BaseMap: React.FC = () => {
  const [isGoogleMaps] = React.useState<boolean>(true);
  return (
    <>
      {/* <button
        className="mapa__button"
        onClick={() => setIsGoogleMaps(!isGoogleMaps)}
      >
        {isGoogleMaps ? 'Cambiar a Leaflet' : 'Cambiar a Google Maps'}
      </button> */}
      <MapMarkersProvider>
        {isGoogleMaps ?
          <MapaGoogleMaps />
          :
          <MapaLeaflet />
        }
      </MapMarkersProvider>
    </>
  );
};

export default BaseMap;