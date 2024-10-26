import { APIProvider, ColorScheme, Map } from '@vis.gl/react-google-maps';
import React from 'react';
import styles from './Mapa.module.css';
import oficinas from '../../data/oficinas';
import OficinaMarker from '../Markers/OficinaMarker/OficinaMarker';
import CamionMarker from '../Markers/CamionMarker/CamionMarker';
import { useSimulation } from '../../context/Simulacion/useSimulation';
import PanelPrincipal from '../Panels/PanelPrincipal/PanelPrincipal';

const Mapa: React.FC = () => {
  const { state } = useSimulation();
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
      </Map>
    </APIProvider>
  );
};

export default Mapa;