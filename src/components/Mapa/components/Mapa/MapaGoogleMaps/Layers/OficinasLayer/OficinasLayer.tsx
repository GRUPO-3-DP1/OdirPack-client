import React from "react";
import oficinas from "../../../../../../../data/oficinas";
import OficinaMarker from "../../Markers/OficinaMarker/OficinaMarker";
import { useMapMarker } from "../../../../../../../context/MapMarker/useMapMarker";
import { useSimulation } from "../../../../../../../context/Simulacion/useSimulation";
import { Oficina } from "../../../../../../../context/Simulacion/simulationTypes";


interface OficinasLayerProps {
  onOficinaClick: (oficina: Oficina) => void;
}

const OficinasLayer: React.FC<OficinasLayerProps> = ({ onOficinaClick }) => {
  const { state } = useSimulation();

  console.log(state.offices);

  const { visibility } = useMapMarker();

  if (!visibility.oficinas) return null;

  return (
    <>
      {oficinas.map((oficina, index) => (
        <OficinaMarker
          key={index}
          oficina={oficina}
          onClick={(e) => {
            e.domEvent.stopPropagation();
            onOficinaClick(oficina);
          }}
        />
      ))}
    </>
  );
};

export default OficinasLayer;