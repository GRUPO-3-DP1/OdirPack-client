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
      {state.vehicles.map((vehicle) => (
        <CamionMarker
          key={vehicle.idVehiculo}
          camion={vehicle}
          title={`Vehículo ${vehicle.idVehiculo}`}
          onClick={(e) => {
            e.domEvent.stopPropagation();
            onCamionClick(vehicle);
          }}
        />
      ))}
    </>
  );
};

export default CamionesLayer;