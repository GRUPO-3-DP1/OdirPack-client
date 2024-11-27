// MapaOperacion.tsx
import React, { useState } from 'react';
import { Vehicle as Camion } from '../../../context/OperacionDia/operacionTypes';
import { useOperacion } from '../../../context/OperacionDia/useOperacion';
import PanelLeyenda from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Panels/PanelLeyenda/PanelLeyenda';
import PanelInformacion from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Panels/PanelInformacion/PanelInformacion';
import PanelResultados from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Panels/PanelResultados/PanelResultados';
import { Oficina } from '../../../context/OperacionDia/operacionTypes';
import Mapa from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Mapa';
import OficinasLayer from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Layers/OficinasLayer/OficinasLayer';
import CamionesLayer from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Layers/CamionesLayer/CamionesLayer';
import BloqueosLayer from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Layers/BloqueosLayer/BloqueosLayer';

interface MapaProps {
  alwaysShowInfoPanel?: boolean;
  operationType?: 'semanal' | 'colapso' | 'diaadia';
}

const MapaOperacion: React.FC<MapaProps> = ({ alwaysShowInfoPanel = true, operationType = 'diaadia' }) => {
  const { state } = useOperacion(); // Asegúrate de usar el contexto correcto

  const [selectedOficina, setSelectedOficina] = useState<Oficina | null>(null);
  const [selectedCamion, setSelectedCamion] = useState<Camion | null>(null);

  const handleOficinaClick = (oficina: Oficina) => {
    setSelectedOficina(oficina);
    setSelectedCamion(null);
  };

  const handleCamionClick = (camion: Camion) => {
    setSelectedCamion(camion);
    setSelectedOficina(null);
  };

  const handleMapClick = () => {
    setSelectedOficina(null);
    setSelectedCamion(null);
  };

  return (
    <Mapa onClick={handleMapClick}>
      {/* Paneles */}
      <PanelLeyenda />

      <PanelInformacion
        show={alwaysShowInfoPanel || state.isPlaying}
        selectedOficina={selectedOficina}
        selectedCamion={selectedCamion}
        operationType={operationType}
      />

      <PanelResultados show={state.ends} />

      {/* Layers de marcadores */}
      <BloqueosLayer />
      <OficinasLayer onOficinaClick={handleOficinaClick} />
      <CamionesLayer onCamionClick={handleCamionClick} />
    </Mapa>
  );
};

export default MapaOperacion;
