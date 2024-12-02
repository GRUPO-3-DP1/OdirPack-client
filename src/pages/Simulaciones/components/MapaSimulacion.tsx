import React, { useState, useEffect } from 'react';
import { Vehicle as Camion } from '../../../context/Simulacion/simulationTypes';
import { useData } from '../../../context/useData';
import { useSelection } from '../../../context/Buscador/useSelection';
import PanelLeyenda from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Panels/PanelLeyenda/PanelLeyenda';
import PanelInformacion from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Panels/PanelInformacion/PanelInformacion';
import PanelResultados from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Panels/PanelResultados/PanelResultados';
import { Oficina } from '../../../context/Simulacion/simulationTypes';
//import { Order } from '../../../context/Simulacion/simulationTypes';
import Mapa from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Mapa';
import OficinasLayer from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Layers/OficinasLayer/OficinasLayer';
import CamionesLayer from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Layers/CamionesLayer/CamionesLayer';
import BloqueosLayer from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Layers/BloqueosLayer/BloqueosLayer';

interface MapaProps {
  alwaysShowInfoPanel?: boolean;
  operationType?: 'semanal' | 'colapso' | 'diaadia';
}

const MapaSimulacion: React.FC<MapaProps> = ({ alwaysShowInfoPanel = false, operationType = 'semanal' }) => {
  const { state } = useData();
  const [showResumen, setShowResumen] = useState(false);

  const handleCloseResumen = () => {
    setShowResumen(false);
  };

  useEffect(() => {
    if (state.ends) {
      setShowResumen(true);
    }
  }, [state.ends]);

  const {
    selectedOficina,
    setSelectedOficina,
    selectedCamion,
    setSelectedCamion,
    selectedPedido,
    setSelectedPedido,
  } = useSelection(); 

  const handleOficinaClick = (oficina: Oficina) => {
    setSelectedOficina(oficina);
    setSelectedCamion(null);
    setSelectedPedido(null);
  };

  const handleCamionClick = (camion: Camion) => {
    setSelectedCamion(camion);
    setSelectedOficina(null);
    setSelectedPedido(null);
  };

  const handleMapClick = () => {
    setSelectedOficina(null);
    setSelectedCamion(null);
    setSelectedPedido(null);
  };

  return (
    <Mapa onClick={handleMapClick}>
      {/* Paneles */}
      <PanelLeyenda />

      <PanelInformacion
        show={alwaysShowInfoPanel || state.isPlaying}
        selectedOficina={selectedOficina}
        selectedCamion={selectedCamion}
        selectedPedido={selectedPedido} 
        operationType={operationType}
      />

      {/*<PanelResultados show={state.ends} />*/}
      {showResumen && (
        <PanelResultados show={true} onClose={handleCloseResumen} />
      )}

      {/* Layers de marcadores */}
      <BloqueosLayer />
      <OficinasLayer onOficinaClick={handleOficinaClick} />
      <CamionesLayer onCamionClick={handleCamionClick} />
    </Mapa>
  );
};

export default MapaSimulacion;
