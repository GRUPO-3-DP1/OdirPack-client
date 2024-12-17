import React, { useEffect } from 'react';
import { MapMarkersProvider } from '../../../../../context/MapMarker/MapMarkerContext';
import MapaSimulacion from '../../../../../pages/Simulaciones/components/MapaSimulacion';
import MapaOperacion from '../../../../../pages/OperacionesDiaDia/components/MapaOperacion';

interface MapaProps {
  operationType: 'SEMANAL' | 'COLAPSO' | 'DIAADIA';
}

const BaseMap: React.FC<MapaProps> = ({ operationType }) => {

  // Log only on operationType changes
  useEffect(() => {
    //console.log('MSJ: BaseMap - operationType cambió a:', operationType);
  }, [operationType]);

  return (
    <>
      <MapMarkersProvider>
        {operationType === 'DIAADIA' ? <MapaOperacion /> : <MapaSimulacion operationType={operationType}/>}
      </MapMarkersProvider>
    </>
  );
};

export default BaseMap;