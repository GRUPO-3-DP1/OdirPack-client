import React from 'react';
import styles from './Mapa.module.css';
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from 'react-leaflet';

interface MapaProps {
  children?: React.ReactNode;
}

const Mapa: React.FC<MapaProps> = ({ children }) => {

  const skins: string[] = [
    "https://tiles.stadiamaps.com/tiles/stamen_toner_background/{z}/{x}/{y}{r}.png",
    "https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png",
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",
    "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png"
  ];

  return (
    <MapContainer
      center={[-11.566435, -75.044072]}
      zoom={5}
      scrollWheelZoom={false}
      className={styles.map}
    >
      <TileLayer url={skins[2]} />
      {children}
    </MapContainer>
  );
};

export default Mapa;