import React from 'react';
import { Marker, MarkerProps } from 'react-leaflet';
import L from 'leaflet';

type Oficina = {
  ubigeo: string;
  departamento: string;
  provincia: string;
  latitud: number;
  longitud: number;
  regionNatural: string;
  almacen: number;
};

interface OficinaMarkerProps extends Omit<MarkerProps, 'position'> {
  oficina: Oficina;
}

const OficinaMarker: React.FC<OficinaMarkerProps> = ({ oficina, ...markerProps }) => {

  const createCamionIcon = () => {
    const svgString = `
      <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="#000000" viewBox="0 0 24 24"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path></g></svg>
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

  return (
    <Marker
      {...markerProps}
      position={[oficina.latitud, oficina.longitud]}
      icon={createCamionIcon()}
    />
  );
};

export default OficinaMarker;