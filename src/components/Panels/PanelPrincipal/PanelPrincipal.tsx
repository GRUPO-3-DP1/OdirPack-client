import { ControlPosition, MapControl } from '@vis.gl/react-google-maps';
import React from 'react';
import { useSimulation } from '../../../context/Simulacion/useSimulation';
import {
  ExpandMore,
  AccessTimeFilled,
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

dayjs.extend(duration);

interface PanelPrincipalProps {
  show: boolean;
}

const PanelPrincipal: React.FC<PanelPrincipalProps> = ({ show }) => {
  const { state } = useSimulation();

  if (!show) {
    return null;
  }

  const {     
    trucksInMotion,
    trucksInMaintenance,
    totalTrucks,
    totalOffices,
    occupiedOffices,
    ordersDelivered,
    ordersPending,
    startTime, 
    currentTime, 
    endTime 
  } = state;

  const totalTime = endTime.getTime() - startTime.getTime();
  const elapsedTime = currentTime.getTime() - startTime.getTime();
  const progressPercentage = Math.floor((elapsedTime / totalTime) * 100);

  const fleetSaturation = `${trucksInMotion + trucksInMaintenance} / ${totalTrucks}`;
  const officeSaturation = `${occupiedOffices} / ${totalOffices}`;

  const elapsedDuration = dayjs.duration(elapsedTime);
  const formattedElapsedTime = formatElapsedTime(elapsedDuration);

  function formatElapsedTime(elapsedDuration: Duration): string {
    const totalSeconds = elapsedDuration.asSeconds();
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    let formatted = '';
    if (days > 0) {
      formatted += `${days}d `;
    }
    formatted += `${hours}h ${minutes}m ${seconds}s`;

    return formatted.trim();
  }
  
  return (
    <MapControl position={ControlPosition.TOP_RIGHT}>    
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
                <b>Información de la simulación</b>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <b>Simulación:</b>{' '}
                <Typography component="span" variant="body2" color="textPrimary">
                  Semanal
                </Typography>
              </Typography>
            </div>
            <Box display="flex" flexDirection="column" alignItems="center">
              <AccessTimeFilled color="primary" sx={{ mb: 0.5 }} />
              <Typography variant="body2" color="textSecondary">
                <b>Completado:</b>{' '}
                <Typography component="span" variant="body2" color="textPrimary">
                  {progressPercentage}%
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
              {/* Fecha y hora y Tiempo transcurrido en dos columnas */}
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

              {/* Sección Camiones */}
              <Typography variant="subtitle2" color="textPrimary" sx={{ mt: 1 }}>
                <b>Camiones</b>
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex">
                  <Typography variant="body2" color="textSecondary">
                    En movimiento:
                  </Typography>
                  <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                    {trucksInMotion}
                  </Typography>
                </Box>
                <Box display="flex">
                  <Typography variant="body2" color="textSecondary">
                    En mantenimiento:
                  </Typography>
                  <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                    {trucksInMaintenance}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Saturación de flota:{' '}
                <Typography component="span" variant="body2" color="textPrimary">
                  {fleetSaturation}
                </Typography>
              </Typography>

              {/* Sección Oficinas */}
              <Typography variant="subtitle2" color="textPrimary" sx={{ mt: 1 }}>
                <b>Oficinas</b>
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Saturación de oficinas:{' '}
                <Typography component="span" variant="body2" color="textPrimary">
                  {officeSaturation}
                </Typography>
              </Typography>

              {/* Sección Pedidos */}
              <Typography variant="subtitle2" color="textPrimary" sx={{ mt: 1 }}>
                <b>Pedidos</b>
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex">
                  <Typography variant="body2" color="textSecondary">
                    Entregados:
                  </Typography>
                  <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                    {ordersDelivered}
                  </Typography>
                </Box>
                <Box display="flex">
                  <Typography variant="body2" color="textSecondary">
                    Pendientes:
                  </Typography>
                  <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                    {ordersPending}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>      
    </MapControl>
  );
};

export default PanelPrincipal;