import React from 'react';
import styles from './Mapa.module.css';
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from 'react-leaflet';
import { useSimulation } from '../../../../../context/Simulacion/useSimulation';
import { leafletSkins } from '../../../../../data/leafletSkins';
import oficinas from '../../../../../data/oficinas';
import CamionMarker from './Markers/CamionMarker/CamionMarker';
import OficinaMarker from './Markers/OficinaMarker/OficinaMarker';

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
        <OficinaMarker key={index} oficina={oficina} />
      ))}
      {state.vehicles.map((vehicle, index) => (
        <CamionMarker key={index} camion={vehicle} />
      ))}
      {children}
    </MapContainer>
  );
};

export default Mapa;