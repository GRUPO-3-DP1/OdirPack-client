import { APIProvider, ColorScheme, Map } from '@vis.gl/react-google-maps';
import React from 'react';
import styles from './Mapa.module.css';
import oficinas from '../../data/oficinas';
import OficinaMarker from '../Markers/OficinaMarker/OficinaMarker';
import CamionMarker from '../Markers/CamionMarker/CamionMarker';
import { useSimulation } from '../../context/Simulacion/useSimulation';
import PanelPrincipal from '../Panels/PanelPrincipal/PanelPrincipal';
import PanelLeyenda from '../Panels/PanelLeyenda/PanelLeyenda';
import Bloqueo from './components/Bloqueo/Bloqueo';
import PanelResultados from '../Panels/PanelResultados/PanelResultados';
import { useArchivos } from '../../context/Archivos/useArchivos';
import { getFechaBloqueo } from '../../data/bloqueos';

const Mapa: React.FC = () => {
  const { state } = useSimulation();

  const { bloqueos } = useArchivos();

  const currentTime = state.currentTime;
  const currentYear = new Date().getFullYear();
  return (
    <APIProvider apiKey="AIzaSyAf4vRvjVvt-AuStWjrfbA-tJNYouHBpb4">
      <Map
        className={styles.mapa}
        defaultCenter={{ lat: -11.566435, lng: -75.044072 }}
        defaultZoom={8}
        gestureHandling={'greedy'}
        disableDefaultUI
        keyboardShortcuts={false}
        colorScheme={ColorScheme.LIGHT}
        mapId={"49ae42fed52588c3"}
        mapTypeId={"roadmap"}
      >
        {bloqueos && Object.entries(bloqueos).map(([, bloqueosDelMes]) =>
          bloqueosDelMes.map((bloqueo) => {
            const { inicio, fin } = getFechaBloqueo(bloqueo, currentYear);

            // Verifica si el bloqueo está activo en el tiempo actual
            if (inicio <= currentTime && fin >= currentTime) {
              return (
                <Bloqueo key={`${bloqueo.ugOri}-${bloqueo.ugDes}-${bloqueo.mesInicio}-${bloqueo.diaInicio}`} inicio={bloqueo.posicionOrigen} fin={bloqueo.posicionDestino} />
              );
            }
            return null;
          })
        )}
        <PanelLeyenda />
        <PanelPrincipal show={state.isPlaying} />
        {oficinas.map((oficina, index) => (
          <OficinaMarker
            key={index}
            oficina={oficina}
          />
        ))}
        {state.vehicles.map(vehicle => (
          <CamionMarker
            key={vehicle.idVehiculo}
            camion={vehicle}
            title={`Vehículo ${vehicle.idVehiculo}`}
          />
        ))}
        <PanelResultados show={state.ends} />
      </Map>
    </APIProvider>
  );
};

export default Mapa;