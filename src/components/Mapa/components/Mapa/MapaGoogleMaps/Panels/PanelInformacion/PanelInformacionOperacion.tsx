import { ControlPosition, MapControl } from '@vis.gl/react-google-maps';
import React, { } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import styles from './PanelInformacion.module.css';
dayjs.extend(duration);

import { Oficina, Vehicle as Camion, Order } from '../../../../../../../context/Simulacion/simulationTypes';
import TruckView from '../../../../InformationPanel/TruckView';
import OfficeView from '../../../../InformationPanel/OfficeView';
import OrderView from '../../../../InformationPanel/OrderView';
//import StatusView from '../../../../InformationPanel/StatusView';
import SearchView from '../../../../InformationPanel/SearchView';
import OperacionView from '../../../../InformationPanel/OperacionView';

interface PanelInformacionOperacionProps {
  show: boolean;
  selectedOficina: Oficina | null;
  selectedCamion: Camion | null;
  selectedPedido: Order | null;
}

const PanelInformacionOperacion: React.FC<PanelInformacionOperacionProps> = ({
  show,
  selectedOficina,
  selectedCamion,
  selectedPedido,
}) => {
  if (!show) {
    return null;
  }

  return (
    <MapControl position={ControlPosition.TOP_RIGHT}>
      <div className={styles.panel}>
        {/*<StatusView />*/}
        <SearchView />
        <div>
          {selectedCamion ? (
            <TruckView
              selectedCamion={selectedCamion}
              operationType='diaadia'
              showRegisterAveria={true}
            />
          ) : selectedOficina ? (
            <OfficeView selectedOficina={selectedOficina} />
          ) : selectedPedido ? (
            <OrderView selectedPedido={selectedPedido} />
          ) : <OperacionView />}
        </div>
      </div>
    </MapControl>
  );
};

export default PanelInformacionOperacion;