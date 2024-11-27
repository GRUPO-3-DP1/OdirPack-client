import React from "react";
import { useData } from '../../../../../../../context/useData';
import { useArchivos } from "../../../../../../../context/Archivos/useArchivos";
import { useMapMarker } from "../../../../../../../context/MapMarker/useMapMarker";
import { getFechaBloqueo } from "../../../../../../../data/bloqueos";
import Bloqueo from "../../../../Bloqueo/Bloqueo";

const BloqueosLayer: React.FC = () => {
  const { state } = useData(); // Estado global de la simulación
  const { bloqueos } = useArchivos(); // Datos de bloqueos
  const { visibility } = useMapMarker(); // Visibilidad de la capa
  const currentYear = new Date().getFullYear(); // Año actual para cálculos

  // No renderiza nada si la capa no es visible o no hay bloqueos
  if (!visibility.tramosBloqueados || !bloqueos || !state.isPlaying) return null;

  // Renderiza los bloqueos activos
  const renderBloqueos = () => {
    return Object.entries(bloqueos).flatMap(([, bloqueosDelMes]) =>
      bloqueosDelMes.map((bloqueo) => {
        const { inicio, fin } = getFechaBloqueo(bloqueo, currentYear);

        // Solo renderiza bloqueos activos en el tiempo actual
        if (inicio <= state.currentTime && fin >= state.currentTime) {
          return (
            <Bloqueo
              key={`${bloqueo.ugOri}-${bloqueo.ugDes}-${bloqueo.mesInicio}-${bloqueo.diaInicio}`}
              inicio={bloqueo.posicionOrigen}
              fin={bloqueo.posicionDestino}
            />
          );
        }
        return null;
      })
    );
  };

  return <>{renderBloqueos()}</>;
};

export default BloqueosLayer;