import React, { useState } from 'react';
import { ControlPosition, MapControl } from '@vis.gl/react-google-maps';
import styles from './PanelResultados.module.css';
import { Box, Typography, Button, IconButton, Divider, Dialog } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useData } from '../../../../../../../context/useData';
import { Order } from '../../../../../../../context/Simulacion/simulationTypes';
import { Visibility } from '@mui/icons-material';
import ResultPanel from '../../../../ResultsPanel/ResultPanel';

dayjs.extend(duration);

type PanelResultadosProps = {
  show?: boolean;
  onClose?: () => void;
};

const PanelResultados: React.FC<PanelResultadosProps> = ({ show = true, onClose }) => {
  const { state } = useData();
  const { 
    ends, 
    simulationHistory, 
    startTime, 
    endTime, 
    executionStartTime, 
    executionEndTime,
    colapso,
    offices  // Añadir esta línea
  } = state;

  // Estado para mostrar el modal de detalle
  const [showDetalle, setShowDetalle] = useState(false);

  // Función para formatear el tiempo real
  const getRealTime = () => {
    if (!executionStartTime) return '0h 0m 0s';
    const end = executionEndTime || new Date();
    const diff = dayjs.duration(end.getTime() - executionStartTime.getTime());
    return `${diff.hours()}h ${diff.minutes()}m ${diff.seconds()}s`;
  };

  // Determinar si la simulación terminó con datos finales
  let finalPedidosEntregados = 0;
  let finalPedidosPendientes = 0;
  let finalTotalCamiones = 0;
  let finalCamionesEnMovimiento = 0;
  let finalCamionesEnMantenimiento = 0;

  if (ends && simulationHistory.length > 0) {
    // Tomar la última entrada del historial
    const lastEntry = simulationHistory[simulationHistory.length - 1];

    // Calcular pedidos entregados y pendientes
    finalPedidosEntregados = lastEntry.pedidos.filter(p => p.estado === 'Entregado').length;
    finalPedidosPendientes = lastEntry.pedidos.filter(p => p.estado !== 'Entregado').length;

    // Calcular camiones
    finalTotalCamiones = lastEntry.camiones.length;
    finalCamionesEnMovimiento = lastEntry.camiones.filter(c => c.estado === 'En tránsito').length;
    // Camiones en mantenimiento se asume = total - en movimiento - completados
    // Pero aquí, "Averiado" son los en mantenimiento.
    //const averiados = lastEntry.camiones.filter(c => c.estado === 'Averiado').length;
    finalCamionesEnMantenimiento = finalTotalCamiones - finalCamionesEnMovimiento;

  } else {
    // Si aún no terminó o no hay historial, usar el estado actual
    finalPedidosEntregados = state.ordersDelivered;
    finalPedidosPendientes = state.ordersPending;
    finalTotalCamiones = state.vehicles.length;
    finalCamionesEnMovimiento = state.trucksInMotion;
    finalCamionesEnMantenimiento = state.trucksInMaintenance;
  }

  // Calcular saturaciones de oficinas finales
  const totalOficinas = offices.length;
  let countLowSaturation = 0;
  let countMediumSaturation = 0;
  let countHighSaturation = 0;

  offices.forEach((oficina) => {
    if (oficina.isAlmacen) return;

    const maxCapacity = oficina.almacen || 0;
    const currentLoad = oficina.currentOrders?.reduce(
      (total: number, currentOrder: { order: Order; arrivalTime: Date }) =>
        total + (currentOrder.order.cantidad || 0),
      0
    ) || 0;

    const occupancyRate = maxCapacity > 0 ? currentLoad / maxCapacity : 0;
    if (occupancyRate > 0.8) {
      countHighSaturation += 1;
    } else if (occupancyRate > 0.5) {
      countMediumSaturation += 1;
    } else {
      countLowSaturation += 1;
    }
  });

  // Cálculo de tiempo simulado considerando colapso
  const tiempoSimuladoMs = endTime.getTime() - startTime.getTime();
  const tiempoSimulado = dayjs.duration(colapso?.collapseDate ? 
    colapso.collapseDate.getTime() - startTime.getTime() : 
    tiempoSimuladoMs
  );

  // Formateo de fechas considerando colapso
  const fechaInicio = dayjs(startTime).format('DD/MM/YYYY, hh:mm A');
  const fechaFin = dayjs(colapso?.collapseDate || endTime).format('DD/MM/YYYY, hh:mm A');

  const totalPedidos = finalPedidosEntregados + finalPedidosPendientes;

  const handleVerDetalle = () => {
    setShowDetalle(true);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <MapControl position={ControlPosition.TOP_CENTER}>
      <div className={styles.panelRestult}>
        <Box sx={{ padding: '16px', position: 'relative' }}>
          {/* Título centrado y botón de cerrar */}
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              position: 'relative',
            }}
          >
            Resumen de la simulación semanal
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: '8px',
              right: '8px',
            }}
          >
            <CloseIcon />
          </IconButton>

          <Divider sx={{ marginY: 1.5 }} />

          {/* Detalles de pedidos */}
          <Typography variant="subtitle1">
            <b>Detalles de pedidos (Total: {totalPedidos}):</b>
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography sx={{ marginTop: 1 }}>
              ✅ Entregados: {finalPedidosEntregados}
            </Typography>
            <Typography sx={{ marginTop: 1 }}>
              ⏳ Pendientes: {finalPedidosPendientes}
            </Typography>
          </Box>

          {/* Detalles de camiones */}
          <Typography variant="subtitle1" sx={{ marginTop: 1.5 }}>
            <b>Detalles de camiones (Flota: {finalTotalCamiones}):</b>
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography sx={{ marginTop: 1 }}>
              🚚 Movimiento: {finalCamionesEnMovimiento}
            </Typography>
            <Typography sx={{ marginTop: 1 }}>
              🛠️ Mantenimiento: {finalCamionesEnMantenimiento}
            </Typography>
          </Box>

          {/* Detalles de oficinas */}
          <Typography variant="subtitle1" sx={{ marginTop: 1.5 }}>
            <b>Detalles de oficinas (Sedes: {totalOficinas}):</b>
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography sx={{ marginTop: 1 }} >
                🟩 Saturación {'<'}50%: {countLowSaturation}
              </Typography>
              <Typography sx={{ marginTop: 1 }}>
                🟥 Saturación {'>'}80%: {countHighSaturation}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ marginTop: 2.5 }}>
                🟨 Saturación 50-80%: {countMediumSaturation}
              </Typography>
            </Box>
          </Box>

          {/* Tiempos */} {/*comentario para María: Aquí siempre esta 7d*/}
          <Typography variant="subtitle1" sx={{ marginTop: 1.5 }}>
            <b>Tiempos:</b>
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography sx={{ marginTop: 0.5 }}>
              ⏱️ Real: {ends && executionStartTime ? getRealTime() : '0h 0m 0s'}
            </Typography>
            <Typography sx={{ marginTop: 0.5 }}>
              ⏱️ Simulado: {ends ? (
                `${tiempoSimulado.days()}d ${tiempoSimulado.hours()}h ${tiempoSimulado.minutes()}m`
              ) : (
                '0d 0h 0m'
              )}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" >
            <Typography sx={{ marginTop: 1 }}> {/*comentario para María: Aquí siempre esta 7d*/}
              📅 Inicio: {ends ? fechaInicio : 'Simulación no iniciada'}
            </Typography>
            <Typography sx={{ marginTop: 1 }}>
              📅 Fin: {ends ? (
                colapso?.willCollapse ? `${fechaFin} (Colapso)` : fechaFin
              ) : 'Simulación no iniciada'}
            </Typography>
          </Box>

          {/* Botón "Ver Detalle" */}
          <Box sx={{ textAlign: 'center', marginTop: 2.5}}> 
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleVerDetalle}
              sx={{
                textTransform: 'none',
                gap: 1,
              }}
            >
              <Visibility sx={{ fontSize: 20 }} />
              Planes de transporte
            </Button>
          </Box>

          {showDetalle && (
            <Dialog
              open={showDetalle}
              onClose={() => setShowDetalle(false)}
              fullWidth
              maxWidth="lg"
              PaperProps={{
                sx: { borderRadius: 2 },
              }}
            >
              <ResultPanel />
            </Dialog>
          )}
        </Box>
      </div>
    </MapControl>
  );
};

export default PanelResultados;
