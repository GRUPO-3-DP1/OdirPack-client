import { APIProvider, ColorScheme, Map } from '@vis.gl/react-google-maps';
import React from 'react';
import styles from './Mapa.module.css';
import oficinas from '../../data/oficinas';
import OficinaMarker from '../Markers/OficinaMarker/OficinaMarker';
import CamionMarker from '../Markers/CamionMarker/CamionMarker';
import { useSimulation } from '../../context/Simulacion/useSimulation';

const Mapa: React.FC = () => {
  const { state } = useSimulation();
  return (
    <APIProvider apiKey="AIzaSyAf4vRvjVvt-AuStWjrfbA-tJNYouHBpb4">
      <Map
        className={styles.mapa}
        defaultCenter={{ lat: -11.566435, lng: -75.044072 }}
        defaultZoom={8}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        keyboardShortcuts={false}
        colorScheme={ColorScheme.LIGHT}
        mapId={"49ae42fed52588c3"}
        mapTypeId={"roadmap"}
      >
        {oficinas.map((oficina, index) => (
          <OficinaMarker
            key={index}
            oficina={oficina}
          />
        ))}
        {Array.from(state.vehicles.entries()).map(([vehicleId, position]) => (
          <CamionMarker
            key={vehicleId}
            position={{ lat: position.lat, lng: position.lng }}
            title={`Vehículo ${vehicleId}`}
          />
        ))}
      </Map>
    </APIProvider>
  );
};

export default Mapa;