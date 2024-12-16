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
  }

  const { state } = data;
  const { visibility } = useMapMarker();

  // Verificar la condición según el tipo de estado
  const isActiveOrPlaying = 'isPlaying' in state ? state.isPlaying : state.isActive;

  if (!visibility.camiones || !isActiveOrPlaying) return null;

  return (
    <>
      {state.vehicles.map((vehicle) => {
        // Carga actual del camión
        const currentTramoLoad = (() => {
          if (vehicle && vehicle.ruta && vehicle.ruta.pedidos) {
            const pedidos = vehicle.ruta.pedidos;
            const currentTime = state.currentTime;
            const pedidosEnCamion = pedidos.filter((pedido) => {
              const index = pedidos.indexOf(pedido);
              const fechaRecogida = vehicle.ruta.fechasSalida[index]
                ? new Date(vehicle.ruta.fechasSalida[index])
                : null;
              const fechaLlegada = vehicle.ruta.fechasLlegada[index]
                ? new Date(vehicle.ruta.fechasLlegada[index])
                : null;

              if (fechaRecogida && fechaLlegada) {
                return fechaRecogida <= currentTime && fechaLlegada > currentTime;
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