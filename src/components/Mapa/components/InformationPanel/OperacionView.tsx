import React, { useEffect, useState } from 'react';
import { 
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Box,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import dayjs from 'dayjs';
import oficinas from '../../../../data/oficinas';
import { useOperacion } from '../../../../context/OperacionDia/useOperacion';
import usePedidos from '../../../../store/hooks/usePedidos';
import { calculateTrucksInMotion } from '../../../../utils/calculateTrucksInMotion';

interface OrderStats {
  pending: number;
  planned: number;
  delivered: number;
  new: number;
}

const OperationView: React.FC = () => {
  const { state } = useOperacion();
  const { pedidos, fetchPedidos } = usePedidos();
  const { currentTime, vehicles, lastPlanificationTime } = state;
  const [orderStats, setOrderStats] = useState<OrderStats>({
    pending: 0,
    planned: 0,
    delivered: 0,
    new: 0
  });

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPedidos]);

  useEffect(() => {
    // Get all orders from vehicles
    const vehicleOrderIds = new Set(
      vehicles.flatMap(vehicle => 
        vehicle.ruta?.pedidos.map(p => p.idPedido.toString()) || []
      )
    );

    // Get delivered orders
    const deliveredOrders = vehicles.flatMap(vehicle => 
      (vehicle.ruta?.pedidos || []).filter(pedido => {
        if (!pedido.fechaLlegada) return false;
        const arrivalTime = new Date(pedido.fechaLlegada);
        return !isNaN(arrivalTime.getTime()) && currentTime >= arrivalTime;
      })
    );
    const deliveredOrderIds = new Set(deliveredOrders.map(p => p.idPedido.toString()));

    const newStats: OrderStats = {
      // Orders in pedidos but not in vehicles are pending
      pending: pedidos.filter(p => !vehicleOrderIds.has(p.pedidoId.toString())).length,
      // Orders in vehicles but not delivered are planned
      planned: Array.from(vehicleOrderIds).filter(id => !deliveredOrderIds.has(id)).length,
      // Delivered orders count
      delivered: deliveredOrderIds.size,
      // New orders (registered in last 3 hours)
      new: pedidos.filter(p => {
        if (!p.fechaRegistro) return false;
        const registrationTime = new Date(p.fechaRegistro);
        if (isNaN(registrationTime.getTime())) return false;
        const threeHoursAgo = new Date(currentTime.getTime() - 3 * 60 * 60 * 1000);
        return registrationTime >= threeHoursAgo;
      }).length
    };

    setOrderStats(newStats);
  }, [pedidos, vehicles, currentTime]);

  const fleetSaturation = vehicles.length;
  const trucksInMotion = calculateTrucksInMotion(state.vehicles);
  //console.log("State: ", vehicles.filter((vehicle) => vehicle.position.currentSegmentIndex !== -1) )
  const trucksInMaintenance = fleetSaturation - trucksInMotion;

  const totalOffices = oficinas.length - 3;
  const officeSaturation = oficinas.reduce((acc, oficina) => {
    if (oficina.isAlmacen) return acc;

    const maxCapacity = oficina.almacen || 0;
    const currentLoad = vehicles
      .flatMap(vehicle => vehicle.ruta?.pedidos || [])
      .reduce((total, pedido) => {
        const belongsToOffice = pedido.ubigeoDestino === oficina.ubigeo;
        if (!pedido.fechaLlegada || !belongsToOffice) return total;
        
        const arrivalTime = new Date(pedido.fechaLlegada);
        if (isNaN(arrivalTime.getTime())) return total;
        
        const timeLimit = new Date(arrivalTime.getTime() + 4 * 60 * 60 * 1000);
        const isInRange = currentTime >= arrivalTime && currentTime <= timeLimit;
        return isInRange ? total + (pedido.cantidad || 0) : total;
      }, 0);

    const occupancyRate = maxCapacity > 0 ? currentLoad / maxCapacity : 0;

    if (occupancyRate > 0.8) acc.high++;
    else if (occupancyRate > 0.5) acc.medium++;
    else acc.low++;

    return acc;
  }, { low: 0, medium: 0, high: 0 });

  return (
    <>
      <Box sx={{ backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px 4px 0 0' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <div>
            <Typography variant="subtitle1" color="textPrimary">
              <b>Información de la operación día a día</b>
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              <b>Última actualización:</b>{' '}
              <Typography component="span" variant="body2" color="textPrimary">
                {lastPlanificationTime ? dayjs(lastPlanificationTime).format('DD/MM/YYYY HH:mm:ss') : 'No hay actualización'}
              </Typography>
            </Typography>
          </div>
        </Box>
      </Box>

      <Accordion defaultExpanded disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel-pedidos-content"
          id="panel-pedidos-header"
          sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
        >
          <Typography variant="subtitle2" color="textPrimary">
            <b>Detalles de pedidos (Total: {orderStats.pending + orderStats.planned + orderStats.delivered})</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex">
              <Typography variant="body2" color="textSecondary">
                ✅ Entregados:
              </Typography>
              <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                {orderStats.delivered}
              </Typography>
            </Box>
            <Box display="flex">
              <Typography variant="body2" color="textSecondary">
                ⏳ Pendientes:
              </Typography>
              <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                {orderStats.pending + orderStats.planned}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" mt={1.5}>
            <Typography variant="body2" color="textSecondary">
              🆕 Nuevos:
            </Typography>
            <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
              {orderStats.new}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

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
            <Box display="flex" justifyContent="space-between" width="100%">
              <Box display="flex" alignItems="center">
                <Typography variant="body2" color="textSecondary">
                  🟩 Saturación {'<'}50%:
                </Typography>
                <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                  {officeSaturation.low}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Typography variant="body2" color="textSecondary">
                  🟨 Saturación 50%-80%:
                </Typography>
                <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                  {officeSaturation.medium}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" mt={0.5}>
              <Typography variant="body2" color="textSecondary">
                🟥 Saturación {'>'}80%:
              </Typography>
              <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                {officeSaturation.high}
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default OperationView;