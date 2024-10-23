import { APIProvider, ColorScheme, ControlPosition, Map, MapControl } from '@vis.gl/react-google-maps';
import React from 'react';
import styles from './Mapa.module.css';
import oficinas from '../../data/oficinas';
import OficinaMarker from '../Markers/OficinaMarker/OficinaMarker';
import { useSimulation } from '../../context/Simulacion/useSimulation';
import LoadingBar from './components/LoadingBar.tsx/LoadingBar';
import { LinearProgress } from '@mui/material';

const Mapa: React.FC = () => {
  const { state, dispatch } = useSimulation();

  const startSimulation = () => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hora después
    dispatch({ type: 'START_SIMULATION', payload: { startTime, endTime } });
  };

  const stopSimulation = () => {
    dispatch({ type: 'STOP_SIMULATION' });
  };
  return (
    <APIProvider apiKey="AIzaSyAf4vRvjVvt-AuStWjrfbA-tJNYouHBpb4">
      <LoadingBar disabled={!state.isPlaying} />
      <Map
        className={styles.mapa}
        defaultCenter={{ lat: -12.066435, lng: -77.044072 }}
        defaultZoom={15}
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
      </Map>
      <button onClick={startSimulation} disabled={state.isPlaying}>
        Iniciar Simulación
      </button>
      <button onClick={stopSimulation} disabled={!state.isPlaying}>
        Detener Simulación
      </button>
    </APIProvider>
  );
};

export default Mapa;