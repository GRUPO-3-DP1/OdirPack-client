/*
import { APIProvider, ColorScheme, Map } from '@vis.gl/react-google-maps';
import React from 'react';
import styles from './Mapa.module.css';
import { useSimulation } from '../../../../../context/Simulacion/useSimulation';
import { useArchivos } from '../../../../../context/Archivos/useArchivos';
import { getFechaBloqueo } from '../../../../../data/bloqueos';
import Bloqueo from '../../Bloqueo/Bloqueo';
import PanelLeyenda from './Panels/PanelLeyenda/PanelLeyenda';
import PanelPrincipal from './Panels/PanelPrincipal/PanelPrincipal';
import OficinaMarker from './Markers/OficinaMarker/OficinaMarker';
import oficinas from '../../../../../data/oficinas';
import CamionMarker from './Markers/CamionMarker/CamionMarker';
import PanelResultados from './Panels/PanelResultados/PanelResultados';

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
        {bloqueos && state.isPlaying && Object.entries(bloqueos).map(([, bloqueosDelMes]) =>
          bloqueosDelMes.map((bloqueo) => {
            const { inicio, fin } = getFechaBloqueo(bloqueo, currentYear);

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

*/

// Mapa.tsx
import React, { useState } from 'react';
import { APIProvider, ColorScheme, Map } from '@vis.gl/react-google-maps';
import styles from './Mapa.module.css';
import { useSimulation } from '../../../../../context/Simulacion/useSimulation';
import { useArchivos } from '../../../../../context/Archivos/useArchivos';
import { getFechaBloqueo } from '../../../../../data/bloqueos';
import Bloqueo from '../../Bloqueo/Bloqueo';
import PanelLeyenda from './Panels/PanelLeyenda/PanelLeyenda';
import PanelInformacion from './Panels/PanelInformacion/PanelInformacion';
import OficinaMarker, { Oficina } from './Markers/OficinaMarker/OficinaMarker';
import oficinas from '../../../../../data/oficinas';
import CamionMarker from './Markers/CamionMarker/CamionMarker';
import PanelResultados from './Panels/PanelResultados/PanelResultados';
import { useMapMarker } from '../../../../../context/MapMarker/useMapMarker';

interface MapaProps {
  alwaysShowInfoPanel?: boolean;
  operationType?: 'semanal' | 'colapso' | 'diaadia';
}

const Mapa: React.FC<MapaProps> = ({ alwaysShowInfoPanel = false, operationType= 'semanal' }) => {
  const { state } = useSimulation();
  const { bloqueos } = useArchivos();
  const { visibility } = useMapMarker();

  const currentTime = state.currentTime;
  const currentYear = new Date().getFullYear();

  // Estado para la oficina seleccionada
  const [selectedOficina, setSelectedOficina] = useState<Oficina | null>(null);

  // Maneja el clic en una oficina
  const handleOficinaClick = (oficina: Oficina) => {
    setSelectedOficina(oficina);
  };

  // Maneja el clic en el mapa para deseleccionar la oficina
  const handleMapClick = () => {
    setSelectedOficina(null);
  };

  return (
    <APIProvider apiKey="AIzaSyAf4vRvjVvt-AuStWjrfbA-tJNYouHBpb4">
      <Map
        className={styles.mapa}
        defaultCenter={{ lat: -11.566435, lng: -75.044072 }}
        defaultZoom={8}
        gestureHandling="greedy"
        disableDefaultUI
        keyboardShortcuts={false}
        colorScheme={ColorScheme.LIGHT}
        mapId="49ae42fed52588c3"
        mapTypeId="roadmap"
        onClick={handleMapClick}
      >
        {/*Paneles */}
        <PanelLeyenda />
        <PanelInformacion 
            show={alwaysShowInfoPanel || state.isPlaying} 
            selectedOficina={selectedOficina} 
            operationType={operationType}
          />
        <PanelResultados show={state.ends} />
        {/*MArkers */}
        {
          visibility.tramosBloqueados &&
          bloqueos &&
          state.isPlaying &&
          Object.entries(bloqueos).map(([, bloqueosDelMes]) =>
            bloqueosDelMes.map((bloqueo) => {
              const { inicio, fin } = getFechaBloqueo(bloqueo, currentYear);

              if (inicio <= currentTime && fin >= currentTime) {
                return (
                  <Bloqueo
                    key={`${bloqueo.ugOri}-${bloqueo.ugDes}-${bloqueo.mesInicio}-${bloqueo.diaInicio}`}
                    inicio={bloqueo.posicionOrigen}
                    fin={bloqueo.posicionDestino}
                  />
                );
              }
              return null;
            })
          )
        }
        {
          visibility.oficinas &&
          oficinas.map((oficina, index) => (
            <OficinaMarker
              key={index}
              oficina={oficina}
              onClick={(e) => {
                e.domEvent.stopPropagation(); // Evita que el evento se propague al mapa
                handleOficinaClick(oficina);
              }}
            />
          ))
        }
        {
          visibility.camiones &&
          state.vehicles.map((vehicle) => (
            <CamionMarker
              key={vehicle.idVehiculo}
              camion={vehicle}
              title={`Vehículo ${vehicle.idVehiculo}`}
            />
          ))
        }
      </Map>
    </APIProvider>
  );
};

export default Mapa;