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

import OficinaMarker from './Markers/OficinaMarker/OficinaMarker';

import CamionMarker from './Markers/CamionMarker/CamionMarker';
import { Oficina, Vehicle as Camion } from '../../../../../context/Simulacion/simulationTypes';
import oficinas from '../../../../../data/oficinas';
import PanelResultados from './Panels/PanelResultados/PanelResultados';
import { useMapMarker } from '../../../../../context/MapMarker/useMapMarker';
import Ruta from '../../Ruta/Ruta';

interface MapaProps {
  alwaysShowInfoPanel?: boolean;
  operationType?: 'semanal' | 'colapso' | 'diaadia';
}

const Mapa: React.FC<MapaProps> = ({ alwaysShowInfoPanel = false, operationType = 'semanal' }) => {
  const { state } = useSimulation();
  const { bloqueos, rutas } = useArchivos();
  const { visibility } = useMapMarker();

  const currentTime = state.currentTime;
  const currentYear = new Date().getFullYear();

  // Estado para la oficina seleccionada
  const [selectedOficina, setSelectedOficina] = useState<Oficina | null>(null);

  // Estado para el camión seleccionado
  const [selectedCamion, setSelectedCamion] = useState<Camion | null>(null);

  // Maneja el clic en una oficina
  const handleOficinaClick = (oficina: Oficina) => {
    setSelectedOficina(oficina);
    setSelectedCamion(null);
  };

  // Maneja el clic en el mapa para deseleccionar la oficina
  const handleMapClick = () => {
    setSelectedOficina(null);
    setSelectedCamion(null);
  };

  // Maneja el clic en un camión
  const handleCamionClick = (camion: Camion) => {
    setSelectedCamion(camion);
    setSelectedOficina(null); // Deselecciona cualquier oficina seleccionada
  };

  const mergedOffices = oficinas.map((oficina) => {
    const stateOffice = state.offices.find((o) => o.ubigeo === oficina.ubigeo);
    return stateOffice ? { ...oficina, ...stateOffice } : oficina;
  });
  
  return (
    //KEY = AIzaSyAf4vRvjVvt-AuStWjrfbA-tJNYouHBpb4
    //KEY = AIzaSyBwA7pyze0XndTMMLOhspsQdFq8Xj52_eY
    //KEY = AIzaSyCIm_MVTHuuOneXJhD16L4NZ2TOWdew07o
    <APIProvider apiKey="AIzaSyBwA7pyze0XndTMMLOhspsQdFq8Xj52_eY">
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
        onClick={handleMapClick} // Maneja el clic en el mapa
      >
        {/* Paneles */}
        <PanelLeyenda />
        <PanelInformacion
          show={alwaysShowInfoPanel || state.isPlaying}
          selectedOficina={selectedOficina}
          selectedCamion={selectedCamion}
          operationType={operationType}
        />
        <PanelResultados show={state.ends} />

        {/* Rutas */}
        {
          visibility.tramos &&
          rutas &&
          Object.values(rutas).map((ruta) =>
            ruta.connections.map((connection) => (
              <Ruta
                key={`${ruta.coords.lat}-${ruta.coords.lng}-${connection.coords.lat}-${connection.coords.lng}`}
                inicio={ruta.coords}
                fin={connection.coords}
              />
            ))
          )
        }
        {/* Marcadores */}
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
        {/* Oficinas */}
        {
          visibility.oficinas &&
          mergedOffices.map((oficina, index) => {
            // Definir la capacidad máxima
            const maxCapacity = 60;

            // Calcular la carga actual de la oficina
            const currentLoad = oficina.currentOrders
              ? oficina.currentOrders.reduce(
                  (total, currentOrder) => total + (currentOrder.order.cantidad || 0),
                  0
                )
              : 0;

            // Calcular el porcentaje de ocupación
            const occupancyRate = currentLoad / maxCapacity;

            // Determinar el nivel de ocupación
            let ocupacion: 'baja' | 'media' | 'alta' = 'baja';
            if (oficina.isAlmacen) {
              ocupacion = 'baja'; // O ajusta según corresponda para almacenes
            } else if (occupancyRate >= 0.8) {
              ocupacion = 'alta';
            } else if (occupancyRate >= 0.5) {
              ocupacion = 'media';
            } else {
              ocupacion = 'baja';
            }

            return (
              <OficinaMarker
                key={index}
                oficina={oficina}
                ocupacion={ocupacion}
                onClick={(e) => {
                  e.domEvent.stopPropagation(); // Evita que el evento se propague al mapa
                  handleOficinaClick(oficina);
                }}
              />
            );
          })
        }
        {/* Camiones */}
        {
          visibility.camiones &&
          state.isPlaying &&
          state.vehicles.map((vehicle) => (
            <CamionMarker
              key={vehicle.idVehiculo}
              camion={vehicle}
              title={`Vehículo ${vehicle.idVehiculo}`}
              onClick={(e) => {
                e.domEvent.stopPropagation(); // Evita que el evento se propague al mapa
                handleCamionClick(vehicle);
              }}
            />
          ))
        }
      </Map>
    </APIProvider>
  );
};

export default Mapa;
