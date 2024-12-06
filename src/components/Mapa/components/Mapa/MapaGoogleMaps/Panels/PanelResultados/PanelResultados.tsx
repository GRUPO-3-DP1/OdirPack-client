// PanelResultados.tsx

import React, { useEffect, useState } from 'react';
import { ControlPosition, MapControl } from '@vis.gl/react-google-maps';
import styles from './PanelResultados.module.css';
import { Box, Typography, Button, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useData } from '../../../../../../../context/useData';
import { Order } from '../../../../../../../context/Simulacion/simulationTypes';
import { Visibility } from '@mui/icons-material';
import DetalleResultados from './DetalleResultados'; 

dayjs.extend(duration);

type PanelResultadosProps = {
  show?: boolean;
  onClose?: () => void;
};

const PanelResultados: React.FC<PanelResultadosProps> = ({ show = true, onClose }) => {
  const { state } = useData();

  // Obtener los datos necesarios del estado
  const {
    ordersDelivered,
    ordersPending,
    vehicles,
    offices,
    startTime,
    endTime,
    ends,
    trucksInMotion,
    trucksInMaintenance,
  } = state;

  // Estados locales para tiempo real
  const [simulationStartTime, setSimulationStartTime] = useState<Date | null>(null);
  const [simulationEndTime, setSimulationEndTime] = useState<Date | null>(null);
  // Add state for controlling visibility
  const [showDetalle, setShowDetalle] = useState(false);



  useEffect(() => {
    if (!simulationStartTime) {
      setSimulationStartTime(new Date());
    }
  }, [simulationStartTime]);

  useEffect(() => {
    if (ends && simulationStartTime && !simulationEndTime) {
      setSimulationEndTime(new Date());
    }
  }, [ends, simulationStartTime, simulationEndTime]);

  if (!show) {
    return null;
  }

  // Cálculos de pedidos
  const totalPedidos = ordersDelivered + ordersPending;
  const pedidosEntregados = ordersDelivered;
  const pedidosPendientes = ordersPending;

  // Cálculos de camiones
  const totalCamiones = vehicles.length;
  const camionesEnMovimiento = trucksInMotion;
  const camionesEnMantenimiento = trucksInMaintenance;

  // Cálculos de oficinas
  const totalOficinas = offices.length;
  let countLowSaturation = 0;
  let countMediumSaturation = 0;
  let countHighSaturation = 0;

  offices.forEach((oficina) => {
    if (oficina.isAlmacen) {
      return; // Excluir almacenes
    }

    const maxCapacity = oficina.almacen || 0;

    const currentLoad = oficina.currentOrders?.reduce(
      (total: number, currentOrder: { order: Order; arrivalTime: Date }) =>
        total + (currentOrder.order.cantidad || 0),
      0
    ) || 0;

    const occupancyRate = maxCapacity > 0 ? currentLoad / maxCapacity : 0;

    // Determinar el nivel de saturación
    if (occupancyRate > 0.8) {
      countHighSaturation += 1;
    } else if (occupancyRate > 0.5) {
      countMediumSaturation += 1;
    } else {
      countLowSaturation += 1;
    }
  });

  // Cálculos de tiempos
  let tiempoRealMs = 0;
  let tiempoReal = dayjs.duration(0);

  if (simulationStartTime && simulationEndTime) {
    tiempoRealMs = simulationEndTime.getTime() - simulationStartTime.getTime();
    tiempoReal = dayjs.duration(tiempoRealMs);
  }

  const tiempoSimuladoMs = endTime.getTime() - startTime.getTime();
  const tiempoSimulado = dayjs.duration(tiempoSimuladoMs);

  const fechaInicio = dayjs(startTime).format('DD/MM/YYYY, hh:mm A');
  const fechaFin = dayjs(endTime).format('DD/MM/YYYY, hh:mm A');

  const handleVerDetalle = () => {
    setShowDetalle(true);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

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
              position: 'absolute', // Posiciona el botón de cerrar
              top: '8px', // Margen desde la parte superior
              right: '8px', // Margen desde la parte derecha
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
              ✅ Entregados: {pedidosEntregados}
            </Typography>
            <Typography sx={{ marginTop: 1 }}>
              ⏳ Pendientes: {pedidosPendientes}
            </Typography>
          </Box>

          {/* Detalles de camiones */}
          <Typography variant="subtitle1" sx={{ marginTop: 1.5 }}>
            <b>Detalles de camiones (Flota: {totalCamiones}):</b>
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography sx={{ marginTop: 1 }}>
              🚚 Movimiento: {camionesEnMovimiento}
            </Typography>
            <Typography sx={{ marginTop: 1 }}>
              🛠️ Mantenimiento: {camionesEnMantenimiento}
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

          {/* Tiempos */}
          <Typography variant="subtitle1" sx={{ marginTop: 1.5 }}>
            <b>Tiempos:</b>
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography sx={{ marginTop: 0.5 }}>
              ⏱️ Real: {simulationStartTime && simulationEndTime ? (
                `${tiempoReal.hours()}h ${tiempoReal.minutes()}m ${tiempoReal.seconds()}s`
              ) : (
                '0h 0m 0s'
              )}
            </Typography>
            <Typography sx={{ marginTop: 0.5 }}>
              ⏱️ Simulado: {state.isPlaying ? (
                `${tiempoSimulado.days()}d ${tiempoSimulado.hours()}h ${tiempoSimulado.minutes()}m`
              ) : (
                '0d 0h 0m'
              )}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" >
            <Typography sx={{ marginTop: 1 }}>
              📅 Inicio: {simulationStartTime ? fechaInicio : 'Simulación no iniciada'}
            </Typography>
            <Typography sx={{ marginTop: 1 }}>
              📅 Fin: {simulationEndTime ? fechaFin : 'Simulación no iniciada'}
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
              Detalle
            </Button>
          </Box>
          {/* Add DetalleResultados */}
          {showDetalle && (
            <DetalleResultados 
              onClose={() => setShowDetalle(false)}
              // Add any other required props
            />
          )}
        </Box>
      </div>
    </MapControl>
  );
};

export default PanelResultados;
