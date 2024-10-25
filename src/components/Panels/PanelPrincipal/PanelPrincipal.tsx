import { ControlPosition, MapControl } from '@vis.gl/react-google-maps';
import React from 'react';
import styles from './PanelPrincipal.module.css';
import { useSimulation } from '../../../context/Simulacion/useSimulation';
import { ExpandMore, ImportContacts } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import dayjs from 'dayjs';

interface PanelPrincipalProps {
  show: boolean;
}

const PanelPrincipal: React.FC<PanelPrincipalProps> = ({ show }) => {
  const { state } = useSimulation();

  if (!show) {
    return null;
  }

  return (
    <MapControl position={ControlPosition.TOP_RIGHT}>
      <div className={styles.panel}>
        <div className={styles.titlePanel}>
          <div className={styles.information}>
            <span className={styles.title}>Información de la simulación</span>
            <span><b>Simulacion:</b> Semanal</span>
          </div>
          <div className={styles.state}>
            <ImportContacts className={styles.icon} />
            <span>Completado: 50%</span>
          </div>
        </div>
        <Accordion defaultExpanded disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <b>DETALLES DE SIMULACION</b>
          </AccordionSummary>
          <AccordionDetails>
            <div>
              <b>Fecha y hora de simulación: </b>
              <span>{dayjs(state.currentTime).format('DD/MM/YYYY HH:mm:ss')}</span>
            </div>
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel2-content"
            id="panel2-header"
          >
            <b>DETALLES DE SIMULACION</b>
          </AccordionSummary>
          <AccordionDetails>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </AccordionDetails>
        </Accordion>
      </div>
    </MapControl>
  );
};

export default PanelPrincipal;