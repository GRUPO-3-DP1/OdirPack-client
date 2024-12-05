// TruckView.tsx
import React, { useState } from 'react';
import { useData } from '../../../../context/useData';
import { createAveria } from '../../../../store/services/averia';
import {
  ExpandMore,
  LocalShipping,
  CheckCircle,
  PendingActions,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
import { Vehicle as Camion } from '../../../../context/Simulacion/simulationTypes';
import oficinas from '../../../../data/oficinas';
//import styles from './InformationPanel.module.css';

interface TruckViewProps {
  selectedCamion: Camion;
  operationType: 'semanal' | 'colapso' | 'diaadia';
  showRegisterAveria?: boolean; 
}

const TruckView: React.FC<TruckViewProps> = ({ selectedCamion, operationType, showRegisterAveria = true }) => {
  const { state, dispatch } = useData();
  const [tipoAveria, setTipoAveria] = useState<string>('');

  // Función para obtener el tipo de camión
  const getTipoCamion = (capacidadCarga: number) => {
    if (capacidadCarga === 10) return 'C';
    if (capacidadCarga === 20) return 'B';
    return 'A';
  };

  // Función para obtener la velocidad máxima según las regiones
  const getMaxSpeed = (origenRegion: string, destinoRegion: string): number => {
    if (origenRegion === 'COSTA' && destinoRegion === 'COSTA') return 70;
    if (origenRegion === 'COSTA' && destinoRegion === 'SIERRA') return 50;
    if (origenRegion === 'COSTA' && destinoRegion === 'SELVA') return 65;
    if (origenRegion === 'SIERRA' && destinoRegion === 'SIERRA') return 60;
    if (origenRegion === 'SIERRA' && destinoRegion === 'SELVA') return 55;
    if (origenRegion === 'SIERRA' && destinoRegion === 'COSTA') return 50;
    if (origenRegion === 'SELVA' && destinoRegion === 'SELVA') return 65;
    if (origenRegion === 'SELVA' && destinoRegion === 'SIERRA') return 55;
    if (origenRegion === 'SELVA' && destinoRegion === 'COSTA') return 65;
    return 55; // Valor por defecto
  };

  // Función para obtener la velocidad máxima del camión
  const getMaxSpeedForCamion = (camion: Camion) => {
    const currentSegmentIndex = camion.position.currentSegmentIndex;

    if (
      camion.ruta.tramos &&
      camion.ruta.tramos.length > 0 &&
      currentSegmentIndex >= 0 &&
      currentSegmentIndex < camion.ruta.tramos.length
    ) {
      const tramo = camion.ruta.tramos[currentSegmentIndex];
      const origen = oficinas.find((office) => office.ubigeo === tramo.origen.codigo);
      const destino = oficinas.find((office) => office.ubigeo === tramo.destino.codigo);

      if (origen && destino) {
        return getMaxSpeed(origen.regionNatural, destino.regionNatural);
      } else {
        console.warn('Origen o Destino no encontrado para el segmento actual');
      }
    }

    // Si no estamos en un tramo válido, usamos el primer tramo como referencia
    if (camion.ruta.tramos && camion.ruta.tramos.length > 0) {
      const tramo = camion.ruta.tramos[0];
      const origen = oficinas.find((office) => office.ubigeo === tramo.origen.codigo);
      const destino = oficinas.find((office) => office.ubigeo === tramo.destino.codigo);

      if (origen && destino) {
        return getMaxSpeed(origen.regionNatural, destino.regionNatural);
      } else {
        console.warn('Origen o Destino no encontrado para el primer tramo');
      }
    }

    return '55'; // Valor por defecto si no se encuentra información suficiente
  };

  // Carga actual del camión
  const currentTramoLoad = (() => {
    if (selectedCamion && selectedCamion.ruta && selectedCamion.ruta.pedidos) {
      const pedidos = selectedCamion.ruta.pedidos;
      const currentTime = state.currentTime;

      const pedidosEnCamion = pedidos.filter((pedido) => {
        const fechaRecogida = pedido.fechaRecogida ? new Date(pedido.fechaRecogida) : null;
        const fechaLlegada = pedido.fechaLlegada ? new Date(pedido.fechaLlegada) : null;

        if (fechaRecogida && fechaLlegada) {
          return fechaRecogida <= currentTime && fechaLlegada > currentTime;
        } else {
          return false;
        }
      });

      const totalCantidad = pedidosEnCamion.reduce((total, pedido) => total + (pedido.cantidad || 0), 0);

      return totalCantidad;
    }
    return 0;
  })();

  // Pedidos entregados por el camión
  const pedidosDelCamion = selectedCamion?.ruta?.pedidos
    .filter((pedido) => {
      const fechaRegistro = pedido.fechaRegistro ? new Date(pedido.fechaRegistro) : null;
      const fechaLlegada = pedido.fechaLlegada ? new Date(pedido.fechaLlegada) : null;
      return fechaRegistro && fechaRegistro <= state.currentTime && fechaLlegada && fechaLlegada <= state.currentTime;
    })
    .map((pedido) => {
      const estado = 'Entregado';
      return { ...pedido, estado };
    });

  // Pedidos pendientes por entregar
  const pedidosDelCamionActual = selectedCamion?.ruta?.pedidos
    .filter((pedido) => {
      const fechaRegistro = pedido.fechaRegistro ? new Date(pedido.fechaRegistro) : null;
      const fechaLlegada = pedido.fechaLlegada ? new Date(pedido.fechaLlegada) : null;
      return fechaRegistro && fechaRegistro <= state.currentTime && fechaLlegada && fechaLlegada > state.currentTime;
    })
    .map((pedido) => {
      return { ...pedido, estado: 'Pendiente' };
    });

  return (
    <>
      {/* Información principal del camión */}
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
              <b>Información del camión</b>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <b>Código:</b>{' '}
              <Typography component="span" variant="body2" color="textPrimary">
                {selectedCamion.idVehiculo}
              </Typography>
            </Typography>
          </div>
          <Box display="flex" flexDirection="column" alignItems="center">
            <LocalShipping color="primary" fontSize="medium" sx={{ mb: 0.5 }} />
            <Typography variant="body2" color="textSecondary">
              <b>Carga:</b>{' '}
              <Typography component="span" variant="body2" color="textPrimary">
                {currentTramoLoad}/{selectedCamion.capacidadCarga}
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Detalles del camión */}
      <Accordion disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel2-content"
          id="panel2-header"
          sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
        >
          <Typography variant="subtitle2" color="textPrimary">
            <b>Detalles de camión</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
          <Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Box display="flex">
                <Typography variant="body2" color="textSecondary">
                  Tipo camión:
                </Typography>
                <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                  {getTipoCamion(selectedCamion.capacidadCarga)}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex">
                <Typography variant="body2" color="textSecondary">
                  Velocidad máxima:
                </Typography>
                <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                  {getMaxSpeedForCamion(selectedCamion)} Km/h
                </Typography>
              </Box>
              <Box display="flex">
                <Typography variant="body2" color="textSecondary">
                  Capacidad de carga:
                </Typography>
                <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                  {selectedCamion.capacidadCarga}
                </Typography>
              </Box>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Pedidos entregados */}
      <Accordion disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="lista-pedidos-content"
          id="lista-pedidos-header"
          sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
        >
          <Typography variant="subtitle2" color="textPrimary">
            <b>Pedidos entregados</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
          <Box
            sx={{
              maxHeight: '140px',
              overflowY: 'auto',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
            }}
          >
            {pedidosDelCamion && pedidosDelCamion.length > 0 ? (
              pedidosDelCamion.map((pedido) => {
                const isEntregado = pedido.estado === 'Entregado';
                const cardColor = isEntregado ? '#e8f5e9' : '#fffde7';
                const iconColor = isEntregado ? '#66bb6a' : '#ffeb3b';
                const IconComponent = isEntregado ? CheckCircle : PendingActions;

                const destinoOficina = oficinas.find((office) => office.ubigeo === pedido.ubigeoDestino);

                return (
                  <Box
                    key={pedido.idPedido}
                    sx={{
                      backgroundColor: cardColor,
                      padding: '8px',
                      borderRadius: '4px',
                      marginBottom: '8px',
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <IconComponent sx={{ color: iconColor, marginRight: '8px' }} />
                      <Typography variant="subtitle1" color="textPrimary">
                        <b>Pedido {pedido.idPedido}</b>
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      <b>Estado:</b> {pedido.estado}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <b>Cantidad:</b> {pedido.cantidad} unidades
                    </Typography>
                    {destinoOficina && (
                      <Typography variant="body2" color="textSecondary">
                        <b>Destino:</b> {destinoOficina.departamento}, {destinoOficina.provincia}
                      </Typography>
                    )}
                    <Typography variant="body2" color="textSecondary">
                      <b>Hora de entrega:</b> {dayjs(pedido.fechaLlegada).format('DD/MM/YYYY, hh:mm A')}
                    </Typography>
                  </Box>
                );
              })
            ) : (
              <Typography variant="body2" color="textSecondary">
                El camión no tiene pedidos entregados.
              </Typography>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Pedidos programados */}
      <Accordion disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="lista-pedidos-content"
          id="lista-pedidos-header"
          sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
        >
          <Typography variant="subtitle2" color="textPrimary">
            <b>Pedidos programados</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
          <Box
            sx={{
              maxHeight: '140px',
              overflowY: 'auto',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
            }}
          >
            {pedidosDelCamionActual && pedidosDelCamionActual.length > 0 ? (
              pedidosDelCamionActual.map((pedido) => {
                const isEntregado = pedido.estado === 'Entregado';
                const cardColor = isEntregado ? '#e8f5e9' : '#fffde7';
                const iconColor = isEntregado ? '#66bb6a' : '#ffeb3b';
                const IconComponent = isEntregado ? CheckCircle : PendingActions;

                const destinoOficina = oficinas.find((office) => office.ubigeo === pedido.ubigeoDestino);

                return (
                  <Box
                    key={pedido.idPedido}
                    sx={{
                      backgroundColor: cardColor,
                      padding: '8px',
                      borderRadius: '4px',
                      marginBottom: '8px',
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <IconComponent sx={{ color: iconColor, marginRight: '8px' }} />
                      <Typography variant="subtitle1" color="textPrimary">
                        <b>Pedido {pedido.idPedido}</b>
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      <b>Estado:</b> {pedido.estado}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <b>Cantidad:</b> {pedido.cantidad} unidades
                    </Typography>
                    {destinoOficina && (
                      <Typography variant="body2" color="textSecondary">
                        <b>Destino:</b> {destinoOficina.departamento}, {destinoOficina.provincia}
                      </Typography>
                    )}
                    <Typography variant="body2" color="textSecondary">
                      <b>Fecha Registro:</b> {dayjs(pedido.fechaRegistro).format('DD/MM/YYYY, hh:mm A')}
                    </Typography>
                  </Box>
                );
              })
            ) : (
              <Typography variant="body2" color="textSecondary">
                El camión no tiene pedidos programados.
              </Typography>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Registrar Avería */}
      {showRegisterAveria && (
        <Accordion defaultExpanded disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel-averias-content"
            id="panel-averias-header"
            sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
          >
            <Typography variant="subtitle2" color="textPrimary" sx={{ textTransform: "none" }}>
              <b>Registrar avería</b>
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="tipo-averia-label">Tipo de avería</InputLabel>
              <Select
                labelId="tipo-averia-label"
                id="tipo-averia-select"
                value={tipoAveria}
                label="Tipo de Avería"
                onChange={(e) => setTipoAveria(e.target.value as string)}
              >
                <MenuItem value="1">Tipo 1: Avería moderada</MenuItem>
                <MenuItem value="2">Tipo 2: Avería fuerte</MenuItem>
                <MenuItem value="3">Tipo 3: Avería siniestra</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              disabled={!tipoAveria}
              onClick={async () => {
                if (!selectedCamion || !selectedCamion.currentRoute) {
                  console.error('No hay un camión seleccionado o no tiene una ruta activa.');
                  return;
                }

                try {
                  let fechaRegistro: Date;
                  if (operationType === 'semanal') {
                    fechaRegistro = state.currentTime;
                  } else {
                    fechaRegistro = dayjs().toDate();
                  }

                  const horasAdicionales =
                    tipoAveria === '1' ? 4 :
                      tipoAveria === '2' ? 36 :
                        tipoAveria === '3' ? 72 : 0;

                  const fechaReparacion = new Date(fechaRegistro.getTime() + horasAdicionales * 60 * 60 * 1000).toISOString();

                  const averiaData = {
                    tipo: tipoAveria,
                    fechaRegistro: fechaRegistro.toISOString(),
                    ubiInicio: selectedCamion.ruta.tramos[selectedCamion.position.currentSegmentIndex].origen.codigo,
                    ubiFin: selectedCamion.ruta.tramos[selectedCamion.position.currentSegmentIndex].destino.codigo,
                    vehiculoId: selectedCamion.idVehiculo,
                    fechaReparacion, // Duración según el tipo de avería
                    cargaReplanificada: tipoAveria === '2' || tipoAveria === '3',
                  };

                  await createAveria(averiaData);

                  // Actualizar el estado del camión en el contexto
                  const updatedVehicles = state.vehicles.map((vehicle) =>
                    vehicle.idVehiculo === selectedCamion.idVehiculo
                      ? {
                        ...vehicle,
                        //averia: { ...averiaData, isAveria: true },
                        averia: {
                          isAveria: true,
                          tipo: averiaData.tipo,
                          fechaRegistro: averiaData.fechaRegistro,
                          ubiInicio: averiaData.ubiInicio,
                          ubiFin: averiaData.ubiFin,
                          vehiculoId: averiaData.vehiculoId,
                          fechaReparacion: averiaData.fechaReparacion,
                          cargaReplanificada: averiaData.cargaReplanificada,
                          almacenAsignado: vehicle.averia?.almacenAsignado || ''
                        }
                      }
                      : vehicle
                  );

                  dispatch({ type: 'SET_VEHICLES', payload: updatedVehicles });

                } catch (error) {
                  console.error('Error al registrar avería:', error);
                }
              }}
              style={{ textTransform: 'none' }}
            >
              Registrar
            </Button>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
};

export default TruckView;
