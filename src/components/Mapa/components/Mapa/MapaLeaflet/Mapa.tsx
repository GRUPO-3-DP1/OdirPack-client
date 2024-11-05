import React from 'react';
import styles from './Mapa.module.css';
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { useSimulation } from '../../../../../context/Simulacion/useSimulation';
import { leafletSkins } from '../../../../../data/leafletSkins';
import oficinas from '../../../../../data/oficinas';
import L from "leaflet";

interface MapaProps {
  children?: React.ReactNode;
}

const OfficeIcon = () => {
  const svgString = `
    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="" viewBox="0 0 24 24"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path></g></svg>
    `;

  return L.divIcon({
    html: svgString,
    className: 'custom-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const truckIcon = () => {
  const svgString = `
    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="0 0 24 24"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"></path></g></svg>`;

  return L.divIcon({
    html: svgString,
    className: 'custom-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const Mapa: React.FC<MapaProps> = ({ children }) => {
  const { state } = useSimulation();

  return (
    <MapContainer
      center={[-11.566435, -75.044072]}
      zoom={5}
      scrollWheelZoom={false}
      className={styles.map}
    >
      <TileLayer url={leafletSkins[2]} />
      {oficinas.map((oficina, index) => (
        <Marker
          key={index}
          position={[oficina.latitud, oficina.longitud]}
          icon={OfficeIcon()}
        />
      ))}
      {state.vehicles.map((vehicle, index) => (
        <Marker
          key={index}
          position={[vehicle.position.lat, vehicle.position.lng]}
          icon={truckIcon()}
        />
      ))}
      {children}
    </MapContainer>
  );
};

export default Mapa;