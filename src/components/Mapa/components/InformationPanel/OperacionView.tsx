import React from 'react';
import { useOperacionData } from '../../../../context/useData';
import {
  ExpandMore,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Box,
} from '@mui/material';
import dayjs from 'dayjs';

const OperacionView: React.FC = () => {
  const { } = useOperacionData();

  // Valores hardcodeados para mejor rendimiento
  const mockData = {
    totalPedidos: 150,
    pedidosEntregados: 80,
    pedidosPendientes: 50,
    pedidosNuevos: 20,
    totalCamiones: 30,
    camionesEnMovimiento: 25,
    camionesEnMantenimiento: 5,
    totalOficinas: 45,
    oficinasBajaSaturacion: 30,
    oficinasMediSaturacion: 10,
    oficinasAltaSaturacion: 5,
    ultimaActualizacion: new Date('2024-01-16T10:30:00'),
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
              <b>Información de la operación día a día</b>
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              <b>Última actualización:</b>{' '}
              <Typography component="span" variant="body2" color="textPrimary">
                {dayjs(mockData.ultimaActualizacion).format('DD/MM/YYYY HH:mm:ss')}
              </Typography>
            </Typography>
          </div>
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
            <b>Detalles de pedidos (Total: {mockData.totalPedidos})</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex">
              <Typography variant="body2" color="textSecondary">
                ✅ Entregados:
              </Typography>
              <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                {mockData.pedidosEntregados}
              </Typography>
            </Box>
            <Box display="flex">
              <Typography variant="body2" color="textSecondary">
                ⏳ Pendientes:
              </Typography>
              <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                {mockData.pedidosPendientes}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" mt={1.5}>
            <Typography variant="body2" color="textSecondary">
              🆕 Nuevos:
            </Typography>
            <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
              {mockData.pedidosNuevos}
            </Typography>
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
            <b>Detalles de camiones (Flota: {mockData.totalCamiones})</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex">
              <Typography variant="body2" color="textSecondary">
                🔄 Movimiento:
              </Typography>
              <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                {mockData.camionesEnMovimiento}
              </Typography>
            </Box>
            <Box display="flex">
              <Typography variant="body2" color="textSecondary">
                🛠️ Mantenimiento:
              </Typography>
              <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                {mockData.camionesEnMantenimiento}
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
            <b>Detalles de oficinas (Sedes: {mockData.totalOficinas})</b>
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
                  {mockData.oficinasBajaSaturacion}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Typography variant="body2" color="textSecondary">
                  🟨 Saturación 50%-80%:
                </Typography>
                <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                  {mockData.oficinasMediSaturacion}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" mt={0.5}>
              <Typography variant="body2" color="textSecondary">
                🟥 Saturación {'>'}80%:
              </Typography>
              <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                {mockData.oficinasAltaSaturacion}
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default OperacionView;