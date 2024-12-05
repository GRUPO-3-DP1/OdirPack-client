// SimulationView.tsx
import React from 'react';
import { useData } from '../../../../context/useData';
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
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
import { Order } from '../../../../context/Simulacion/simulationTypes';

interface SimulationViewProps {
  operationType: 'semanal' | 'colapso' | 'diaadia';
}

const SimulationView: React.FC<SimulationViewProps> = ({ operationType }) => {
  const { state } = useData();

  const {
    trucksInMotion,
    totalTrucks,
    ordersDelivered,
    ordersPending,
    startTime,
    currentTime,
    endTime,
  } = state;

  const totalTime = endTime.getTime() - startTime.getTime();
  const elapsedTime = currentTime.getTime() - startTime.getTime();
  const progressPercentage = Math.floor((elapsedTime / totalTime) * 100);

  const fleetSaturation = totalTrucks;
  const trucksInMaintenance = fleetSaturation - trucksInMotion;

  // Calcular niveles de saturación de oficinas
  const totalOffices = state.offices.length;
  let countLowSaturation = 0;
  let countMediumSaturation = 0;
  let countHighSaturation = 0;

  state.offices.forEach((oficina) => {
    const maxCapacity = oficina.almacen || 0;

    const currentLoad =
      oficina.currentOrders?.reduce(
        (total: number, currentOrder: { order: Order; arrivalTime: Date }) =>
          total + (currentOrder.order.cantidad || 0),
        0
      ) || 0;

    const occupancyRate = maxCapacity > 0 ? currentLoad / maxCapacity : 0;

    // Determinar el nivel de saturación
    if (oficina.isAlmacen) {
      // Excluir almacenes del conteo
      return;
    }

    if (occupancyRate > 0.8) {
      countHighSaturation += 1;
    } else if (occupancyRate > 0.5) {
      countMediumSaturation += 1;
    } else {
      countLowSaturation += 1;
    }
  });

  return (
    <>
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
              <b>
                Información de la {operationType === 'diaadia' ? 'operación' : 'simulación'}
              </b>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <b>{operationType === 'diaadia' ? 'Operación' : 'Simulación'}:</b>{' '}
              <Typography component="span" variant="body2" color="textPrimary">
                {operationType === 'semanal'
                  ? 'Semanal'
                  : operationType === 'colapso'
                  ? 'Hasta el colapso'
                  : 'Día a día'}
              </Typography>
            </Typography>
          </div>
          {operationType !== 'diaadia' && (
            <Box display="flex" flexDirection="column" alignItems="center">
              <AccessTimeFilled color="primary" sx={{ mb: 0.5 }} />
              <Typography variant="body2" color="textSecondary">
                <b>Completado:</b>{' '}
                <Typography component="span" variant="body2" color="textPrimary">
                  {progressPercentage}%
                </Typography>
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      {/* Accordion para Detalles de pedidos */}
      <Accordion defaultExpanded disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel-pedidos-content"
          id="panel-pedidos-header"
          sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
        >
          <Typography variant="subtitle2" color="textPrimary">
            <b>Detalles de pedidos (Total: {ordersDelivered + ordersPending})</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex">
              <Typography variant="body2" color="textSecondary">
                ✅ Entregados:
              </Typography>
              <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                {ordersDelivered}
              </Typography>
            </Box>
            <Box display="flex">
              <Typography variant="body2" color="textSecondary">
                ⏳ Pendientes:
              </Typography>
              <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                {ordersPending}
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
      {/* Accordion para Detalles de camiones */}
      <Accordion defaultExpanded disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel-camiones-content"
          id="panel-camiones-header"
          sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
        >
          <Typography variant="subtitle2" color="textPrimary">
            <b>Detalles de camiones (Flota: {fleetSaturation})</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex">
              <Typography variant="body2" color="textSecondary">
                🔄 Movimiento:
              </Typography>
              <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                {trucksInMotion}
              </Typography>
            </Box>
            <Box display="flex">
              <Typography variant="body2" color="textSecondary">
                🛠️ Mantenimiento:
              </Typography>
              <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                {trucksInMaintenance}
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
      {/* Accordion para Detalles de oficinas */}
      <Accordion defaultExpanded disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel-oficinas-content"
          id="panel-oficinas-header"
          sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
        >
          <Typography variant="subtitle2" color="textPrimary">
            <b>Detalles de oficinas (Sedes: {totalOffices})</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
          <Box display="flex" flexWrap="wrap" alignItems="center" gap={2}>
            {/* Línea 1 */}
            <Box display="flex" justifyContent="space-between" width="100%">
              <Box display="flex" alignItems="center">
                <Typography variant="body2" color="textSecondary">
                  🟩 Saturación {'<'}50%:
                </Typography>
                <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                  {countLowSaturation}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Typography variant="body2" color="textSecondary">
                  🟨 Saturación 50%-80%:
                </Typography>
                <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                  {countMediumSaturation}
                </Typography>
              </Box>
            </Box>
            {/* Línea 2 */}
            <Box display="flex" alignItems="center" mt={1}>
              <Typography variant="body2" color="textSecondary">
                🟥 Saturación {'>'}80%:
              </Typography>
              <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                {countHighSaturation}
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default SimulationView;
