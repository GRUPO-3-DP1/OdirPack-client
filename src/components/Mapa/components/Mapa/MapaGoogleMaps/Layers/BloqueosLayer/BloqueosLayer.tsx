import React from "react";
import { useData } from '../../../../../../../context/useData';
import { useMapMarker } from "../../../../../../../context/MapMarker/useMapMarker";
import Bloqueo from "../../../../Bloqueo/Bloqueo";
import { Bloqueo as BloqueoType } from "../../../../../../../context/Simulacion/simulationTypes";

const BloqueosLayer: React.FC = () => {
  const { state } = useData();
  const { visibility } = useMapMarker(); // Visibilidad de la capa

  const bloqueos = state.currentBloqueos;

  if (!visibility.tramosBloqueados || !bloqueos || !state.isPlaying) return null;

  const renderBloqueos = () => {
    return bloqueos.map((bloqueo: BloqueoType) => {
      if (state.currentTime >= bloqueo.fechaInicio && state.currentTime <= bloqueo.fechaFin) {
        return <Bloqueo key={bloqueo.idBloqueo} inicio={bloqueo.origen} fin={bloqueo.destino} />;
      }
      return null;
    });
  };
  return <>{renderBloqueos()}</>;
};

export default BloqueosLayer;