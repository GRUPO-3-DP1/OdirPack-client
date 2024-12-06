// TruckView.tsx
import React, { useState } from 'react';
import { useData } from '../../../../context/useData';
import { createAveria } from '../../../../store/services/averia';
import {
  ExpandMore,
  LocalShipping,
  CheckCircle,
  PendingActions,
  ErrorOutline,
  Schedule,
  ExpandLess,
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
import styles from './InformationPanel.module.css';

interface TruckViewProps {
  selectedCamion: Camion;
  operationType: 'semanal' | 'colapso' | 'diaadia';
  showRegisterAveria?: boolean; 
}

const TruckView: React.FC<TruckViewProps> = ({ selectedCamion, operationType, showRegisterAveria = true }) => {
  const { state, dispatch } = useData();
  const [tipoAveria, setTipoAveria] = useState<string>('');
  const [showPastSegments, setShowPastSegments] = useState(true);

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

      // const pedidosEnCamion = pedidos.filter((pedido) => {
      //   const fechaRecogida = pedido.fechaRecogida ? new Date(pedido.fechaRecogida) : null;
      //   const fechaLlegada = pedido.fechaLlegada ? new Date(pedido.fechaLlegada) : null;
        
      //   if (fechaRecogida && fechaLlegada) {
      //     return fechaRecogida <= currentTime && fechaLlegada > currentTime;
      //   } else {
      //     return false;
      //   }
      // });
      const pedidosEnCamion = pedidos.filter((pedido) => {
        // Get dates from selectedCamion.ruta.fechasSalida and fechasLlegada arrays
        const index = pedidos.indexOf(pedido);
        const fechaRecogida = selectedCamion.ruta.fechasSalida[index] 
          ? new Date(selectedCamion.ruta.fechasSalida[index]) 
          : null;
        const fechaLlegada = selectedCamion.ruta.fechasLlegada[index]
          ? new Date(selectedCamion.ruta.fechasLlegada[index])
          : null;
  
        if (fechaRecogida && fechaLlegada) {
          return fechaRecogida <= currentTime && fechaLlegada > currentTime;
        }
        return false;
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
      <Box className={styles.infoContainer}>
        <Box className={styles.flexRow}>
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
          className={styles.accordionSummary}
        >
          <Typography variant="subtitle2" color="textPrimary">
            <b>Detalles de camión</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={styles.accordionDetailsBox}>
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex">
                <Typography variant="body2" color="textSecondary">
                  Tipo camión:
                </Typography>
                <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                  {getTipoCamion(selectedCamion.capacidadCarga)}
                </Typography>
              </Box>
              <Box display="flex">
                <Typography variant="body2" color="textSecondary">
                  Velocidad máxima:
                </Typography>
                <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                  {getMaxSpeedForCamion(selectedCamion)} Km/h
                </Typography>
              </Box>
            </Box>
            {/* <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Box display="flex">
                <Typography variant="body2" color="textSecondary">
                  Estado:
                </Typography>
                <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                  {getTipoCamion(selectedCamion.capacidadCarga)}
                </Typography>
              </Box>
            </Box> */}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Pedidos entregados */}
      <Accordion disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="lista-pedidos-content"
          id="lista-pedidos-header"
          className={styles.accordionSummary}
        >
          <Typography variant="subtitle2" color="textPrimary">
            <b>Pedidos entregados</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={styles.accordionDetailsBox}>
          <Box className={styles.routeBox}>
            {pedidosDelCamion && pedidosDelCamion.length > 0 ? (
              pedidosDelCamion.map((pedido) => {
                const isEntregado = pedido.estado === 'Entregado';
                const cardColor = isEntregado ? '#e8f5e9' : '#fffde7';
                const iconColor = isEntregado ? '#66bb6a' : '#ffeb3b';
                const IconComponent = isEntregado ? CheckCircle : PendingActions;

                const destinoOficina = oficinas.find((office) => office.ubigeo === pedido.ubigeoDestino);
                const origenOficina = pedido.ubigeoOrigen ? oficinas.find((office) => office.ubigeo === pedido.ubigeoOrigen) : null;


                return (
                  <Box
                    key={pedido.idPedido}
                    sx={{
                      backgroundColor: cardColor,
                      padding: '8px',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'flex-start',
                    }}
                  >
                    <IconComponent sx={{ color: iconColor, marginRight: '8px', marginTop: '4px' }} />
                    <Box>
                      <Typography variant="body2" color="textPrimary">
                        <b>{pedido.idPedido}</b>
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <b>Cantidad:</b> {pedido.cantidad} unidades
                      </Typography>
                      {origenOficina && (
                        <Typography variant="body2" color="textSecondary">
                          <b>Origen:</b> {origenOficina.departamento}, {origenOficina.provincia}
                        </Typography>
                      )}
                      {destinoOficina && (
                        <Typography variant="body2" color="textSecondary">
                          <b>Destino:</b> {destinoOficina.departamento}, {destinoOficina.provincia}
                        </Typography>
                      )}
                      <Typography variant="body2" color="textSecondary">
                        <b>Registro:</b> {dayjs(pedido.fechaRegistro).format('DD/MM/YYYY, hh:mm A')}
                      </Typography>
                      {isEntregado && (
                        <Typography variant="body2" color="textSecondary">
                          <b>Entrega:</b> {dayjs(pedido.fechaLlegada).format('DD/MM/YYYY, hh:mm A')}
                        </Typography>
                      )}
                    </Box>
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
          className={styles.accordionSummary}
        >
          <Typography variant="subtitle2" color="textPrimary">
            <b>Pedidos programados</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={styles.accordionDetailsBox}>
          <Box className={styles.routeBox}>
            {pedidosDelCamionActual && pedidosDelCamionActual.length > 0 ? (
              pedidosDelCamionActual.map((pedido) => {
                const isEntregado = pedido.estado === 'Entregado';
                const cardColor = isEntregado ? '#e8f5e9' : '#fffde7';
                const iconColor = isEntregado ? '#66bb6a' : '#ffeb3b';
                const IconComponent = isEntregado ? CheckCircle : PendingActions;

                const destinoOficina = oficinas.find((office) => office.ubigeo === pedido.ubigeoDestino);
                const origenOficina = pedido.ubigeoOrigen ? oficinas.find((office) => office.ubigeo === pedido.ubigeoOrigen) : null;

                return (
                  <Box
                    key={pedido.idPedido}
                    sx={{
                      backgroundColor: cardColor,
                      padding: '8px',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      display: 'flex', // Flexbox para alineación horizontal
                      alignItems: 'flex-start', // Alinear ítems al inicio verticalmente
                    }}
                  >
                    {/* Icono alineado con el texto */}
                    <IconComponent sx={{ color: iconColor, marginRight: '8px', marginTop: '4px' }} />
                    <Box>
                      <Typography variant="body2" color="textPrimary">
                        <b>{pedido.idPedido}</b>
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <b>Cantidad:</b> {pedido.cantidad} unidades
                      </Typography>
                      {origenOficina && (
                        <Typography variant="body2" color="textSecondary">
                          <b>Origen:</b> {origenOficina.departamento}, {origenOficina.provincia}
                        </Typography>
                      )}
                      {destinoOficina && (
                        <Typography variant="body2" color="textSecondary">
                          <b>Destino:</b> {destinoOficina.departamento}, {destinoOficina.provincia}
                        </Typography>
                      )}
                      <Typography variant="body2" color="textSecondary">
                        <b>Registro:</b> {dayjs(pedido.fechaRegistro).format('DD/MM/YYYY, hh:mm A')}
                      </Typography>
                      {!isEntregado && (
                        <Typography variant="body2" color="textSecondary">
                          <b>Plazo máximo:</b> {dayjs(pedido.fechaLlegada).format('DD/MM/YYYY, hh:mm A')}
                        </Typography>
                      )}
                    </Box>
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

      {/* Ruta del camión */}
      <Accordion disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="ruta-camion-content"
          id="ruta-camion-header"
          className={styles.accordionSummary}
        >
          <Typography variant="subtitle2" color="textPrimary">
            <b>Ruta del camión</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={styles.accordionDetailsBox}>
          <Box className={styles.routeBox}>
            {/* Botón para mostrar/ocultar tramos pasados */}
            {selectedCamion.position.currentSegmentIndex > 0 && (
              <Button
                startIcon={showPastSegments ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setShowPastSegments(!showPastSegments)}
                className={styles.toggleButton}
                size="small"
              >
                {showPastSegments ? 'Ocultar tramos pasados' : 'Mostrar tramos pasados'}
              </Button>
            )}

            {selectedCamion.ruta.tramos && selectedCamion.ruta.tramos.map((tramo, index) => {
              const origenOficina = oficinas.find((office) => office.ubigeo === tramo.origen.codigo);
              const destinoOficina = oficinas.find((office) => office.ubigeo === tramo.destino.codigo);
              const fechaSalida = selectedCamion.ruta.fechasSalida[index];
              const fechaLlegada = selectedCamion.ruta.fechasLlegada[index];
              
              const currentTime = state.currentTime;
              const isPast = fechaLlegada && new Date(fechaLlegada) < currentTime;
              const isCurrent = selectedCamion.position.currentSegmentIndex === index;
              const isFuture = index > selectedCamion.position.currentSegmentIndex;

              // Para mostrar que está en mantenimiento en la oficina - se retresa 
              /* // Verificar si el camión está en mantenimiento operativo en la oficina
              const isInMaintenance = selectedCamion.maintenance?.inMaintenance && 
                                     selectedCamion.maintenance.officeUbigeo === tramo.destino.codigo &&
                                     currentTime >= new Date(fechaLlegada);

              // Calcular el tiempo restante de mantenimiento si está en mantenimiento
              let remainingMaintenanceTime = '';
              if (isInMaintenance && selectedCamion.maintenance) {
                const maintenanceEndTime = new Date(selectedCamion.maintenance.startTime.getTime() + selectedCamion.maintenance.duration);
                const remainingTime = maintenanceEndTime.getTime() - currentTime.getTime();
                const remainingMinutes = Math.ceil(remainingTime / (1000 * 60));
                remainingMaintenanceTime = `${remainingMinutes} min restantes`;
              } */

              // Verificar si este es el tramo específico donde ocurre la avería
              const hasBreakdown = selectedCamion.averia?.isAveria && 
                                   new Date(selectedCamion.averia.fechaRegistro) <= currentTime &&
                                   tramo.origen.codigo === selectedCamion.averia.ubiInicio &&
                                   tramo.destino.codigo === selectedCamion.averia.ubiFin;

              // Si es un tramo pasado y están ocultos, no lo mostramos
              if (isPast && !showPastSegments) return null;

              let backgroundColor = '#f5f5f5'; // gris para tramos pasados
              let IconComponent = CheckCircle;
              let iconColor = '#9e9e9e';
              let statusText = '';

              if (hasBreakdown) {
                backgroundColor = '#ffebee';
                IconComponent = ErrorOutline;
                iconColor = '#f44336';
                statusText = 'Averiado';
              } else if (isCurrent) {
                backgroundColor = '#e8f5e9';
                IconComponent = LocalShipping;
                iconColor = '#4caf50';
                statusText = 'En tránsito';
              } else if (isFuture) {
                backgroundColor = '#fff';
                IconComponent = Schedule;
                iconColor = '#2196f3';
                statusText = 'Programado';
              } else {
                statusText = 'Completado';
              }

              return (
                <Box
                  key={index}
                  sx={{
                    backgroundColor,
                    padding: '8px',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    border: isFuture ? '1px dashed #bdbdbd' : 'none',
                  }}
                >
                  <IconComponent sx={{ color: iconColor, marginRight: '8px', marginTop: '4px' }} />
                  <Box>
                    <Typography variant="body2" color="textPrimary">
                      <b>Tramo {index + 1}</b>&nbsp;-&nbsp;{statusText}
                    </Typography>
                    {origenOficina && destinoOficina && (
                      <>
                        <Typography variant="body2" color="textSecondary">
                          <b>Origen:</b> {origenOficina.ubigeo} - {origenOficina.provincia}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <b>Destino:</b> {destinoOficina.ubigeo} - {destinoOficina.provincia}
                        </Typography>
                      </>
                    )}
                    <Typography variant="body2" color="textSecondary">
                      <b>Salida:</b> {fechaSalida ? dayjs(fechaSalida).format('DD/MM/YYYY, hh:mm A') : 'No disponible'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <b>Llegada:</b> {fechaLlegada ? dayjs(fechaLlegada).format('DD/MM/YYYY, hh:mm A') : 'No disponible'}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Registrar Avería */}
      {showRegisterAveria && (
        <Accordion disableGutters>
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
              <InputLabel 
                id="tipo-averia-label"
                sx={{ fontSize: '14px' }}
              >
                Tipo de avería
              </InputLabel>
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
