import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { Vehicle } from '../../../../../../../context/Simulacion/simulationTypes';

type CamionMarkerProps = {
  camion: Vehicle;
};

const CamionMarker: React.FC<CamionMarkerProps> = ({ camion, ...markerProps }) => {
  const createCamionIcon = () => {
    const svgString = `
      <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="#000000" viewBox="0 0 24 24"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"></path></g></svg>
    `;

    return L.divIcon({
      html: `
        <div class="camion-marker" style="transform: rotate(${0}deg)">
          ${svgString}
        </div>
      `,
      className: 'custom-camion-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  if (camion.position.currentSegmentIndex !== -1) {
    console.log('Renderizando camión:', camion.idVehiculo, 'Posición:', camion.position);
  }

  return (
    <>
      {camion.position.currentSegmentIndex !== -1 && (
        <Marker
          {...markerProps}
          position={[camion.position.lat, camion.position.lng]}
          icon={createCamionIcon()}
        />
      )}
    </>
  );
};

export default CamionMarker;