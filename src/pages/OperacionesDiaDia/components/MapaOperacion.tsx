import React from 'react';
import Mapa from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Mapa';

interface MapaProps {
  alwaysShowInfoPanel?: boolean;
  operationType?: 'semanal' | 'colapso' | 'diaadia';
}

const MapaOperacion: React.FC<MapaProps> = () => {
  return (
    <Mapa>
    </Mapa>
  );
};

export default MapaOperacion;