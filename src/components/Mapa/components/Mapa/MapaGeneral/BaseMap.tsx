import React from 'react';
import { MapMarkersProvider } from '../../../../../context/MapMarker/MapMarkerContext';
import MapaSimulacion from '../../../../../pages/Simulaciones/components/MapaSimulacion';
import MapaOperacion from '../../../../../pages/OperacionesDiaDia/components/MapaOperacion';

interface MapaProps {
  operationType: 'semanal' | 'colapso' | 'diaadia';
}

const BaseMap: React.FC<MapaProps> = ({ operationType }) => {
  return (
    <>
      <MapMarkersProvider>
        {operationType === 'diaadia' ? <MapaOperacion /> : <MapaSimulacion />}
      </MapMarkersProvider>
    </>
  );
};

export default BaseMap;