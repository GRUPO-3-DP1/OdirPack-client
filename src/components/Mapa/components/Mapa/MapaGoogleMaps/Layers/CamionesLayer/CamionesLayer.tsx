import { useMapMarker } from '../../../../../../../context/MapMarker/useMapMarker';
import { useData, useOperacionData } from '../../../../../../../context/useData';
import CamionMarker from '../../Markers/CamionMarker/CamionMarker';
import { Vehicle as Camion } from "../../../../../../../context/Simulacion/simulationTypes";

interface CamionesLayerProps {
  onCamionClick: (camion: Camion) => void;
}

const CamionesLayer: React.FC<CamionesLayerProps> = ({ onCamionClick }) => {

  // Intentar obtener el contexto de simulación primero
  let data;
  try {
    data = useData();
  } catch {
    // Si falla, usar el contexto de operación
    data = useOperacionData();
    //console.log("usando operacion data")
  }

  const { state } = data;
  const { visibility } = useMapMarker();

    // En CamionesLayer.tsx
    //console.log('Renderizando camiones:', state.vehicles);

  if (!visibility.camiones || !state.isPlaying) return null;

  return (
    <>
      {state.vehicles.map((vehicle) => {
        // Carga actual del camión
        const currentTramoLoad = (() => {
          if (vehicle && vehicle.ruta && vehicle.ruta.pedidos) {
            const pedidos = vehicle.ruta.pedidos;
            const currentTime = state.currentTime;
            const pedidosEnCamion = pedidos.filter((pedido) => {
              const fechaSalida = pedido.fechaSalida ? new Date(pedido.fechaSalida) : null;
              const fechaLlegada = pedido.fechaLlegada ? new Date(pedido.fechaLlegada) : null;
              if (fechaSalida && fechaLlegada) {
                return fechaSalida <= currentTime && fechaLlegada > currentTime;
              } else if (fechaSalida && !fechaLlegada) {
                // Si no hay fecha de llegada, verificamos si el vehículo está en avería
                const averia = vehicle.averia;
                if (averia && averia.fechaRegistro && averia.fechaReparacion) {
                  const fechaInicioAveria = new Date(averia.fechaRegistro);
                  return (
                    fechaSalida <= currentTime &&
                    currentTime < fechaInicioAveria
                  );
                }
              }
              return false;
            });
            const totalCantidad = pedidosEnCamion.reduce((total, pedido) => total + (pedido.cantidad || 0), 0);
            return totalCantidad;
          }
          return 0;
        })();

        const maxCapacity = vehicle.capacidadCarga;
        const currentLoad = currentTramoLoad;

        const occupancyRate = currentLoad / maxCapacity;

        let ocupacion: 'baja' | 'media' | 'alta' | 'vacio' = 'vacio';
        if (occupancyRate === 0) {
          ocupacion = 'vacio';
        } else if (occupancyRate >= 0.8) {
          ocupacion = 'alta';
        } else if (occupancyRate >= 0.5) {
          ocupacion = 'media';
        } else {
          ocupacion = 'baja';
        }

        return (
          <CamionMarker
            key={vehicle.idVehiculo}
            camion={vehicle}
            title={`Vehículo ${vehicle.idVehiculo}`}
            onClick={(e) => {
              e.domEvent.stopPropagation();
              onCamionClick(vehicle);
            }}
            showRoute={visibility.tramos}
            showAveriado={visibility.camionesAveriados}
            ocupacion={ocupacion}
          />
        );
      })}
    </>
  );
};

export default CamionesLayer;