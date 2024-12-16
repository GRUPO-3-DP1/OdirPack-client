import React from 'react';
import { Vehicle as Camion } from '../../../context/Simulacion/simulationTypes';
import { useOperacionData } from '../../../context/useData';
import { useSelection } from '../../../context/Buscador/useSelection';
import Mapa from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Mapa';
import PanelLeyenda from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Panels/PanelLeyenda/PanelLeyenda';
//import PanelInformacion from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Panels/PanelInformacion/PanelInformacion';
import OficinasLayer from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Layers/OficinasLayer/OficinasLayer';
import CamionesLayer from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Layers/CamionesLayer/CamionesLayer';
//import BloqueosLayer from '../../../components/Mapa/components/Mapa/MapaGoogleMaps/Layers/BloqueosLayer/BloqueosLayer';
import { Oficina } from '../../../context/Simulacion/simulationTypes';

const MapaOperacion: React.FC = () => {
  const { } = useOperacionData();
  const {
    //selectedOficina,
    setSelectedOficina,
    //selectedCamion,
    setSelectedCamion,
    //selectedPedido,
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
      {/*<PanelInformacion
        show={state.isActive}
        selectedOficina={selectedOficina}
        selectedCamion={selectedCamion}
        selectedPedido={selectedPedido}
        operationType="diaadia"
      />*/}

      {/* Layers de marcadores */}
      {/*<BloqueosLayer />*/}
      <OficinasLayer onOficinaClick={handleOficinaClick} />
      <CamionesLayer onCamionClick={handleCamionClick} />
    </Mapa>
  );
};

export default MapaOperacion;