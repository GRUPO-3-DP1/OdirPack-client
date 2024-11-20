import React from "react";
import oficinas from "../../../../../../../data/oficinas";
import OficinaMarker from "../../Markers/OficinaMarker/OficinaMarker";
import { useMapMarker } from "../../../../../../../context/MapMarker/useMapMarker";
import { Oficina, Order } from "../../../../../../../context/Simulacion/simulationTypes";
import { useSimulation } from "../../../../../../../context/Simulacion/useSimulation";


interface OficinasLayerProps {
  onOficinaClick: (oficina: Oficina) => void;
}

const OficinasLayer: React.FC<OficinasLayerProps> = ({ onOficinaClick }) => {
  const { state } = useSimulation();
  const { visibility } = useMapMarker();

  if (!visibility.oficinas) return null;

  const mergedOffices = oficinas.map((oficina) => {
    const stateOffice = state.offices.find((o) => o.ubigeo === oficina.ubigeo);
    return stateOffice ? { ...oficina, ...stateOffice } : oficina;
  });

  return (
    <>
      {
        visibility.oficinas &&
        mergedOffices.map((oficina, index) => {
          // Definir la capacidad máxima
          const maxCapacity = 60;

          // Calcular la carga actual de la oficina
          const currentLoad = oficina.currentOrders?.reduce(
            (total: number, currentOrder: { order: Order; arrivalTime: Date; }) =>
              total + (currentOrder.order.cantidad || 0),
            0
          ) || 0;

          // Calcular el porcentaje de ocupación
          const occupancyRate = currentLoad / maxCapacity;

          // Determinar el nivel de ocupación
          let ocupacion: 'baja' | 'media' | 'alta' = 'baja';
          if (oficina.isAlmacen) {
            ocupacion = 'baja'; // O ajusta según corresponda para almacenes
          } else if (occupancyRate >= 0.8) {
            ocupacion = 'alta';
          } else if (occupancyRate >= 0.5) {
            ocupacion = 'media';
          } else {
            ocupacion = 'baja';
          }

          return (
            <OficinaMarker
              key={index}
              oficina={oficina}
              ocupacion={ocupacion}
              onClick={(e) => {
                e.domEvent.stopPropagation();
                onOficinaClick(oficina);
              }}
            />
          );
        })
      }
    </>
  );
};

export default OficinasLayer;