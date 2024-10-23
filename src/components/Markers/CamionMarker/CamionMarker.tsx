import React from 'react';
import { AdvancedMarker, AdvancedMarkerProps } from '@vis.gl/react-google-maps';
import { LocalShipping } from '@mui/icons-material';
import styles from './CamionMarker.module.css';

interface Location {
  codigo: string;
  descripcion: string;
}

interface RouteSegment {
  origen: Location;
  destino: Location;
}

interface Order {
  idPedido: string;
  ubigeoDestino: string;
  fechaRegistro: string;
  cantidad: number;
  idCliente: string;
}

interface Route {
  tramos: RouteSegment[];
  pedidos: Order[];
  fechaInicio: string;
  fechasSalida: string[];
  fechasLlegada: string[];
}

interface Vehicle {
  idVehiculo: string;
  capacidadCarga: number;
  fechaLibre: string;
  ruta: Route;
}

interface CamionMarkerProps extends AdvancedMarkerProps {
  camion?: Vehicle;
}

const CamionMarker: React.FC<CamionMarkerProps> = ({ ...markerProps }) => {
  return (
    <AdvancedMarker
      {...markerProps}
    >
      <LocalShipping className={styles.camion} />
    </AdvancedMarker>
  );
};

export default CamionMarker;