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
import oficinas from '../../../../data/oficinas';
import { calculateTrucksInMotion } from '../../../../utils/calculateTrucksInMotion';
import { calculateOrdersDelivered } from '../../../../utils/calculateOrdersDelivered';
import { calculateOrdersPending } from '../../../../utils/calculateOrdersPending';

interface SimulationViewProps {
  operationType: 'semanal' | 'colapso' | 'diaadia';
}

const SimulationView: React.FC<SimulationViewProps> = ({ operationType }) => {
  const { state } = useData();

  const {
    startTime,
    currentTime,
    endTime,
  } = state;

  const fleetSaturation = state.vehicles.length;
  const trucksInMotion = calculateTrucksInMotion(state.vehicles);
  const ordersDelivered = calculateOrdersDelivered(state.vehicles,currentTime);
  const ordersPending = calculateOrdersPending(state.vehicles,currentTime);
  //const unplannedOrders = calculateUnplannedOrders(state.vehicles,currentTime);

  const totalTime = endTime.getTime() - startTime.getTime();
  const elapsedTime = currentTime.getTime() - startTime.getTime();
  const progressPercentage = Math.floor((elapsedTime / totalTime) * 100);

  const trucksInMaintenance = fleetSaturation - trucksInMotion;

  // Calcular niveles de saturación de oficinas
  const totalOffices = oficinas.length - 3; // No cambian da igual :v //preparados por si cambia xd
  let countLowSaturation = 0;
  let countMediumSaturation = 0;
  let countHighSaturation = 0;

  oficinas.forEach((oficina) => {
    const maxCapacity = oficina.almacen || 0;

    const currentLoad = state.vehicles
      .flatMap((vehicle) => vehicle.ruta?.pedidos || [])
      .reduce((total, pedido) => {
        const perteneceOficina = pedido.ubigeoDestino === oficina.ubigeo;
        const fechaLlegada = pedido.fechaLlegada ? new Date(pedido.fechaLlegada) : null;
        if (!perteneceOficina || !fechaLlegada) return total;
        const tiempoLimite = new Date(fechaLlegada.getTime() + 4 * 60 * 60 * 1000);
        const estaEnRango = state.currentTime >= fechaLlegada && state.currentTime <= tiempoLimite;
        return estaEnRango ? total + (pedido.cantidad || 0) : total;
    }, 0);

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

  // const totalPedidos = pedidos.filter((pedido) => {
  //   if (pedido.fechaRegistro) {
  //     const registrationTime = new Date(pedido.fechaRegistro);
  //     return registrationTime <= currentTime;
  //   }
  //   return false; // Excluir pedidos sin fecha de registro
  // }).length;

  const getLabel = (operationType: string): string => {
    switch (operationType) {
      case 'semanal':
        return 'Semanal';
      case 'colapso':
        return 'Hasta el colapso';
      case 'diaadia':
      default:
        return 'Semanal';
    }
  };
  
  return (
    <>
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          padding: '8px',
          borderRadius: '4px 4px 0 0',
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
                {getLabel(operationType)}
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
            <Box display="flex" alignItems="center" mt={0.5}>
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
