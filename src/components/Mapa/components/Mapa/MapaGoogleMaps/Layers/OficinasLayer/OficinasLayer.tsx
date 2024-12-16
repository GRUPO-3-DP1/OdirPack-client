import React from "react";
import oficinas from "../../../../../../../data/oficinas";
import OficinaMarker from "../../Markers/OficinaMarker/OficinaMarker";
import { useMapMarker } from "../../../../../../../context/MapMarker/useMapMarker";
import { Oficina } from "../../../../../../../context/Simulacion/simulationTypes";
import { useData, useOperacionData } from '../../../../../../../context/useData';
import { AdvancedMarker } from "@vis.gl/react-google-maps";

interface OficinasLayerProps {
  onOficinaClick: (oficina: Oficina) => void;
}

const OficinasLayer: React.FC<OficinasLayerProps> = ({ onOficinaClick }) => {
  // Intentar obtener el contexto de simulación primero
  let data;
  try {
    data = useData();
    //console.log("usando useData de simulación");
  } catch {
    // Si falla, usar el contexto de operación
    data = useOperacionData();
    //console.log("usando useOperacionData de operaciones");
  }

  const { state } = data;
  const { visibility } = useMapMarker();

  if (!visibility.oficinas && !visibility.almacenes) {
    return (
      <>
        {oficinas.map((oficina, index) => {
          return (
            <AdvancedMarker
              key={index}
              position={{ lat: oficina.latitud, lng: oficina.longitud }}
            >
              {
                oficina.isAlmacen ? (
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      background: '#FFFFFF',
                      border: '3px solid #000000',
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      background: '#1dbe80',
                      border: '1px solid #0e6443',
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )
              }
            </AdvancedMarker>

          );
        })}
      </>
    );
  }

  return (
    <>
      {
        oficinas.map((oficina, index) => {

          // Si es un almacén y la visibilidad de almacenes está desactivada, no lo renderizamos
          if (oficina.isAlmacen && !visibility.almacenes) {
            return null;
          }

          // Si es una oficina y la visibilidad de oficinas está desactivada, no lo renderizamos
          if (!oficina.isAlmacen && !visibility.oficinas) {
            return null;
          }
          // Definir la capacidad máxima
          const maxCapacity = oficina.almacen;

          // Calcular la carga actual de la oficina
          const currentLoad = state.vehicles
          .flatMap((vehicle) => vehicle.ruta?.pedidos || [])
          .reduce((total, pedido) => {
            const perteneceOficina = pedido.ubigeoDestino === oficina.ubigeo;
            const fechaLlegada = pedido.fechaLlegada ? new Date(pedido.fechaLlegada) : null;
            if (!perteneceOficina || !fechaLlegada) return total;
            const tiempoLimite = new Date(fechaLlegada.getTime() + 4 * 60 * 60 * 1000);
            const estaEnRango = state.currentTime >= fechaLlegada && state.currentTime <= tiempoLimite;
            return estaEnRango ? total + (pedido.cantidad || 0) : total;
          }, 0);

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