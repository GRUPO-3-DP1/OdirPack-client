import React from 'react';
import styles from './Mapa.module.css';
import "leaflet/dist/leaflet.css";
import { MapContainer, Polyline, TileLayer } from 'react-leaflet';
import { useSimulation } from '../../../../../context/Simulacion/useSimulation';
import { leafletSkins } from '../../../../../data/leafletSkins';
import oficinas from '../../../../../data/oficinas';
import CamionMarker from './Markers/CamionMarker/CamionMarker';
import OficinaMarker from './Markers/OficinaMarker/OficinaMarker';
import { useArchivos } from '../../../../../context/Archivos/useArchivos';
import { getFechaBloqueo } from '../../../../../data/bloqueos';

interface MapaProps {
  children?: React.ReactNode;
}

const Mapa: React.FC<MapaProps> = ({ children }) => {
  const { state } = useSimulation();

  const { bloqueos } = useArchivos();

  const currentTime = state.currentTime;
  const currentYear = new Date().getFullYear();

  return (
    <MapContainer
      center={[-9.566435, -72.044072]}
      zoom={6}
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
      {bloqueos && state.isPlaying && Object.entries(bloqueos).map(([, bloqueosDelMes]) =>
        bloqueosDelMes.map((bloqueo) => {
          const { inicio, fin } = getFechaBloqueo(bloqueo, currentYear);

          if (inicio <= currentTime && fin >= currentTime) {
            return (
              <Polyline
                key={`${bloqueo.ugOri}-${bloqueo.ugDes}-${bloqueo.mesInicio}-${bloqueo.diaInicio}`}
                positions={[[bloqueo.posicionOrigen.lat, bloqueo.posicionOrigen.lng], [bloqueo.posicionDestino.lat, bloqueo.posicionDestino.lng]]}
                color='red'
                weight={1}
              />
            );
          }
          return null;
        })
      )}
      {children}
    </MapContainer>
  );
};

export default Mapa;