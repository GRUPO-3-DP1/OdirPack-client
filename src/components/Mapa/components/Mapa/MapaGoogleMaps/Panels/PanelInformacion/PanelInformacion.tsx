// PanelInformacion.tsx
import { ControlPosition, MapControl } from '@vis.gl/react-google-maps';
import React from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import styles from './PanelInformacion.module.css';
dayjs.extend(duration);
import { Oficina } from '../../../../../../../context/Simulacion/simulationTypes';
import { Vehicle as Camion } from '../../../../../../../context/Simulacion/simulationTypes';
import { Order } from '../../../../../../../context/Simulacion/simulationTypes';

import TruckView from '../../../../InformationPanel/TruckView';
import OfficeView from '../../../../InformationPanel/OfficeView';
import OrderView from '../../../../InformationPanel/OrderView';
import SimulationView from '../../../../InformationPanel/SimulationView';
import StatusView from '../../../../InformationPanel/StatusView';

interface PanelInformacionProps {
  show: boolean;
  selectedOficina: Oficina | null;
  selectedCamion: Camion | null;
  selectedPedido: Order | null;
  operationType: 'semanal' | 'colapso' | 'diaadia';
}

const PanelInformacion: React.FC<PanelInformacionProps> = ({
  show,
  selectedOficina,
  selectedCamion,
  selectedPedido,
  operationType,
}) => {

  if (!show) {
    return null;
  }
  return (
    <MapControl position={ControlPosition.TOP_RIGHT}>
      <div className={styles.panel}>
        <StatusView />
        <div>
          {selectedCamion ? (
            <TruckView
              selectedCamion={selectedCamion}
              operationType={operationType}
              showRegisterAveria={false} // Muestra la sección "Registrar Avería"
            />
          ) : selectedOficina ? (
            <OfficeView selectedOficina={selectedOficina} />
          ) : selectedPedido ? (
            <OrderView selectedPedido={selectedPedido} />
          ) : (
            <SimulationView operationType={operationType} />
          )}
        </div>
      </div>
    </MapControl>
  );
};

export default PanelInformacion;
