// PanelOficina.tsx
import { ControlPosition, MapControl } from '@vis.gl/react-google-maps';
import React from 'react';
import { useSimulation } from '../../../../../../../context/Simulacion/useSimulation';
import {
  ExpandMore,
  Business,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Box,
} from '@mui/material';
import dayjs from 'dayjs';
import duration, { Duration } from 'dayjs/plugin/duration';
import styles from './PanelOficina.module.css';

dayjs.extend(duration);

import { Oficina } from '../../Markers/OficinaMarker/OficinaMarker';

interface PanelOficinaProps {
  show: boolean;
  oficina: Oficina;
  onClose: () => void;
}

const PanelOficina: React.FC<PanelOficinaProps> = ({ show, oficina, onClose }) => {
  const { state } = useSimulation();

  if (!show || !oficina) {
    return null;
  }

  const { startTime, currentTime, endTime } = state;

  const totalTime = endTime.getTime() - startTime.getTime();
  const elapsedTime = currentTime.getTime() - startTime.getTime();
  const progressPercentage = Math.floor((elapsedTime / totalTime) * 100);

  const elapsedDuration = dayjs.duration(elapsedTime);
  const formattedElapsedTime = formatElapsedTime(elapsedDuration);

  function formatElapsedTime(elapsedDuration: Duration): string {
    const totalSeconds = elapsedDuration.asSeconds();
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let formatted = '';
    if (days > 0) {
      formatted += `${days}d `;
    }
    formatted += `${hours}h ${minutes}m`;

    return formatted.trim();
  }

  // Valores de ejemplo para la operación; reemplaza con datos reales si están disponibles
  const cargaPorcentaje = 92; // Valor de ejemplo
  const cantidadPaquetes = 200; // Valor de ejemplo
  const capacidadTotal = 500; // Valor de ejemplo
  const paquetesRecibidos = 420; // Valor de ejemplo

  return (
    <MapControl position={ControlPosition.TOP_RIGHT}>
      <div className={styles.panel}>
        <Box
          sx={{
            backgroundColor: '#f5f5f5',
            padding: '8px',
            borderRadius: '4px',
            marginBottom: '8px',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <div>
              <Typography variant="subtitle1" color="textPrimary">
                <b>Información oficina</b>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <b>Oficina:</b>{' '}
                <Typography component="span" variant="body2" color="textPrimary">
                  {oficina.departamento}, {oficina.provincia}
                </Typography>
              </Typography>
            </div>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Business color="primary" sx={{ mb: 0.5 }} />
              <Typography variant="body2" color="textSecondary">
                <b>Carga:</b>{' '}
                <Typography component="span" variant="body2" color="textPrimary">
                  {cargaPorcentaje}%
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Box>
        <Accordion defaultExpanded disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1-content"
            id="panel1-header"
            sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
          >
            <Typography variant="subtitle2" color="textPrimary">
              <b>Detalles de simulación</b>
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Fecha y hora
                  </Typography>
                  <Typography variant="body2" color="textPrimary">
                    {dayjs(currentTime).format('DD/MM/YYYY HH:mm:ss')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Tiempo transcurrido
                  </Typography>
                  <Typography variant="body2" color="textPrimary">
                    {formattedElapsedTime}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel2-content"
            id="panel2-header"
            sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
          >
            <Typography variant="subtitle2" color="textPrimary">
              <b>Detalles de oficina</b>
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Box display="flex">
                  <Typography variant="body2" color="textSecondary">
                    Código:
                  </Typography>
                  <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                    OFC-{oficina.almacen}
                  </Typography>
                </Box>
                <Box display="flex">
                  <Typography variant="body2" color="textSecondary">
                    Ubigeo:
                  </Typography>
                  <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                    {oficina.ubigeo}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex">
                  <Typography variant="body2" color="textSecondary">
                    Latitud:
                  </Typography>
                  <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                    {oficina.latitud}
                  </Typography>
                </Box>
                <Box display="flex">
                  <Typography variant="body2" color="textSecondary">
                    Longitud:
                  </Typography>
                  <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                    {oficina.longitud}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel3-content"
            id="panel3-header"
            sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
          >
            <Typography variant="subtitle2" color="textPrimary">
              <b>Operación</b>
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Cantidad de paquetes:{' '}
                <Typography component="span" variant="body2" color="textPrimary">
                  {cantidadPaquetes} / {capacidadTotal} ({cargaPorcentaje}%)
                </Typography>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Cantidad de paquetes recibidos:{' '}
                <Typography component="span" variant="body2" color="textPrimary">
                  {paquetesRecibidos}
                </Typography>
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
      </div>
    </MapControl>
  );
};

export default PanelOficina;