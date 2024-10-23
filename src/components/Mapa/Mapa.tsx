import { APIProvider, ColorScheme, Map } from '@vis.gl/react-google-maps';
import React from 'react';
import styles from './Mapa.module.css';
import oficinas from '../../data/oficinas';
import OficinaMarker from '../Markers/OficinaMarker/OficinaMarker';
import CamionMarker from '../Markers/CamionMarker/CamionMarker';

//{ ubigeo: '150101', departamento: 'LIMA', provincia: 'LIMA', latitud: -12.04591952, longitud: -77.03049615, regionNatural: 'COSTA', almacen: 100; }
//{ ubigeo: '070101', departamento: 'CALLAO', provincia: 'CALLAO', latitud: -12.06034168, longitud: -77.14068058, regionNatural: 'COSTA', almacen: 241 }
//{ ubigeo: '150601', departamento: 'LIMA', provincia: 'HUARAL', latitud: -11.495407273, longitud: -77.207186976, regionNatural: 'COSTA', almacen: 67 }

const camiones = [
  {
    id: '1',
    latitud: -12.04591952,
    longitud: -77.03049615,
    almacen: 10,
    destino: { latitud: -12.06034168, longitud: -77.14068058 },
    duracion: 10000,
  },
  {
    id: '2',
    latitud: -12.04591952,
    longitud: -77.03049615,
    almacen: 20,
    destino: { latitud: -11.495407273, longitud: -77.207186976 },
    duracion: 80000,
  }
];

const Mapa: React.FC = () => {
  return (
    <APIProvider apiKey="AIzaSyAf4vRvjVvt-AuStWjrfbA-tJNYouHBpb4">
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
        {camiones.map((camion) => (
          <CamionMarker
            key={camion.id}
            camion={camion}
            destino={camion.destino}
            duracion={camion.duracion}
          />
        ))}
      </Map>
    </APIProvider>
  );
};

export default Mapa;