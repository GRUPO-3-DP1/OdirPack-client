import React from 'react';
import styles from './Mapa.module.css';
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { useSimulation } from '../../../../../context/Simulacion/useSimulation';
import { leafletSkins } from '../../../../../data/leafletSkins';
import oficinas from '../../../../../data/oficinas';

interface MapaProps {
  children?: React.ReactNode;
}

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
        />
      ))}
      {state.vehicles.map((vehicle, index) => (
        <Marker
          key={index}
          position={[vehicle.position.lat, vehicle.position.lng]}
        />
      ))}
      {children}
    </MapContainer>
  );
};

export default Mapa;