import { useMapMarker } from '../../../../../../../context/MapMarker/useMapMarker';
import { useData } from '../../../../../../../context/useData';
import CamionMarker from '../../Markers/CamionMarker/CamionMarker';
import { Vehicle as Camion } from "../../../../../../../context/Simulacion/simulationTypes";

interface CamionesLayerProps {
  onCamionClick: (camion: Camion) => void;
}

const CamionesLayer: React.FC<CamionesLayerProps> = ({ onCamionClick }) => {
  const { state } = useData();
  const { visibility } = useMapMarker();

  if (!visibility.camiones || !state.isPlaying) return null;

  return (
    <>
      {state.vehicles.map((vehicle) => {
        const currentTramoLoad = (() => {
          if (vehicle && vehicle.ruta && vehicle.ruta.pedidos) {
            const pedidos = vehicle.ruta.pedidos;
            const currentTime = state.currentTime;

            const pedidosEnCamion = pedidos.filter((pedido) => {
              const fechaRecogida = pedido.fechaRecogida ? new Date(pedido.fechaRecogida) : null;
              const fechaLlegada = pedido.fechaLlegada ? new Date(pedido.fechaLlegada) : null;

              if (fechaRecogida && fechaLlegada) {
                return fechaRecogida <= currentTime && fechaLlegada > currentTime;
              } else {
                return false;
              }
            });

            const totalCantidad = pedidosEnCamion.reduce((total, pedido) => total + (pedido.cantidad || 0), 0);

            return totalCantidad;
          }
          return 0;
        })();

        const maxCapacity = vehicle.capacidadCarga;
        const currentLoad = currentTramoLoad;

        const occupancyRate = currentLoad / maxCapacity;

        let ocupacion: 'baja' | 'media' | 'alta' = 'baja';
        if (occupancyRate >= 0.8) {
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