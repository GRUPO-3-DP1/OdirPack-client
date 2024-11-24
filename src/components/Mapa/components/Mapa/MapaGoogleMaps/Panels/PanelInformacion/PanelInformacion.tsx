// PanelInformacion.tsx
import { ControlPosition, MapControl } from '@vis.gl/react-google-maps';
import React, { useState } from 'react';
import { useSimulation } from '../../../../../../../context/Simulacion/useSimulation';
import {
  ExpandMore,
  AccessTimeFilled,
  Business,
  LocalShipping,
  Build,
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
import styles from './PanelInformacion.module.css';

dayjs.extend(duration);

import { Oficina } from '../../../../../../../context/Simulacion/simulationTypes';
import { Vehicle as Camion } from '../../../../../../../context/Simulacion/simulationTypes';
import oficinas from '../../../../../../../data/oficinas';

interface PanelInformacionProps {
  show: boolean;
  selectedOficina: Oficina | null;
  selectedCamion: Camion | null;
  operationType: 'semanal' | 'colapso' | 'diaadia';
}

const PanelInformacion: React.FC<PanelInformacionProps> = ({
  show,
  selectedOficina,
  selectedCamion,
  operationType,
}) => {
  const { state } = useSimulation();
  const [tipoAveria, setTipoAveria] = useState<string>('');


  if (!show) {
    return null;
  }

  const {
    trucksInMotion,
    trucksInMaintenance,
    totalTrucks,
    ordersDelivered,
    ordersPending,
    startTime,
    currentTime,
    endTime,
  } = state;

  const officeData = state.offices.find((office) => office.ubigeo === selectedOficina?.ubigeo);
  // Calcula la carga actual
  const currentLoad =
    officeData && officeData.currentOrders
      ? officeData.currentOrders.reduce((total, currentOrder) => total + (currentOrder.order.cantidad || 0), 0)
      : 'Ilimitado';

  const maxCapacity = selectedOficina?.almacen || 0;

  const totalTime = endTime.getTime() - startTime.getTime();
  const elapsedTime = currentTime.getTime() - startTime.getTime();
  const progressPercentage = Math.floor((elapsedTime / totalTime) * 100);

  const fleetSaturation = `${trucksInMotion + trucksInMaintenance} / ${totalTrucks}`;

  //Para ver los pedidos de las oficinas
  const scheduledVehicles = state.vehicles.flatMap((vehicle) => {
    if (!vehicle.ruta || !vehicle.ruta.tramos || !vehicle.ruta.fechasLlegada) return [];
    return vehicle.ruta.tramos.map((tramo, index) => {
      if (
        tramo?.destino?.codigo &&
        selectedOficina?.ubigeo &&
        tramo.destino.codigo === selectedOficina.ubigeo
      ) {
        const arrivalTimeStr = vehicle.ruta.fechasLlegada[index];
        const arrivalTime = arrivalTimeStr ? new Date(arrivalTimeStr) : null;
        if (arrivalTime && arrivalTime >= state.currentTime) {
          return {
            vehicle,
            arrivalTime,
            deliveringOrders: vehicle.ruta.pedidos.filter(
              (pedido) => pedido.ubigeoDestino === selectedOficina.ubigeo
            ),
          };
        }
      }
      return null;
    }).filter(Boolean);
  }).filter(Boolean);
  

  // Obtener camiones en mantenimiento en la oficina seleccionada
  const maintenanceVehicles = state.vehicles.filter(
    (vehicle) =>
      vehicle?.maintenance?.inMaintenance &&
      vehicle.maintenance.officeUbigeo === selectedOficina?.ubigeo
  );


  // Crear un mapeo de código de destino a índice de segmento
  const destinoToSegmentIndex: { [ubigeoDestino: string]: number; } = {};
  selectedCamion?.ruta?.tramos?.forEach((tramo, index) => {
    destinoToSegmentIndex[tramo.destino.codigo] = index;
  });

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

  const getTipoCamion = (capacidadCarga: number) => {
    if (capacidadCarga === 10) return 'C';
    if (capacidadCarga === 20) return 'B';
    return 'A';
  };

  //{getMaxSpeedForCamion(selectedCamion)} Km/h
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
    // Puedes agregar más condiciones según sea necesario
    return 55; // Valor por defecto si no se encuentra una coincidencia
  };

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
        console.warn('Origen or Destino not found for current segment index');
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
        console.warn('Origen or Destino not found for first tramo');
      }
    }

    return '55'; // Valor por defecto si no se encuentra información suficiente 
  };


  return (
    <MapControl position={ControlPosition.TOP_RIGHT}>
      <div className={styles.panel}>
        {selectedCamion ? (
          // Información del camión seleccionado
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
            <Accordion defaultExpanded disableGutters>
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
                    <MenuItem value="tipo1">Tipo 1 - Dos horas detenido</MenuItem>
                    <MenuItem value="tipo2">Tipo 2 - No disponible en 1 turno</MenuItem>
                    <MenuItem value="tipo3">Tipo 3 - Mantenimiento correctivo</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!tipoAveria}
                  onClick={() => {
                    console.log(`Avería registrada para el camión ${selectedCamion.idVehiculo}: ${tipoAveria}`);
                    // LOGICA DE AVERIAS
                  }}
                  style={{ textTransform: 'none' }}
                >
                  Registrar
                </Button>
              </AccordionDetails>
            </Accordion>
          </>
        ) : selectedOficina ? (
          // Información de la oficina seleccionada
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
                    <b>Información de las oficinas</b>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <b>Oficina:</b>{' '}
                    <Typography component="span" variant="body2" color="textPrimary">
                      {selectedOficina.departamento}, {selectedOficina.provincia}
                    </Typography>
                  </Typography>
                </div>

                <Box display="flex" flexDirection="column" alignItems="center">
                  <Business color="primary" sx={{ mb: 0.5 }} />
                  <Typography variant="body2" color="textSecondary">
                    <b>Stock:</b>{' '}
                    <Typography component="span" variant="body2" color="textPrimary">
                      {currentLoad !== 'Ilimitado' ? `${currentLoad}/${maxCapacity}` : 'Ilimitado'}
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Box>
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
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Box display="flex">
                      <Typography variant="body2" color="textSecondary">
                        Código:
                      </Typography>
                      <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                        OFC-{selectedOficina.almacen}
                      </Typography>
                    </Box>
                    <Box display="flex">
                      <Typography variant="body2" color="textSecondary">
                        Ubigeo:
                      </Typography>
                      <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                        {selectedOficina.ubigeo}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex">
                      <Typography variant="body2" color="textSecondary">
                        Latitud:
                      </Typography>
                      <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                        {selectedOficina.latitud}
                      </Typography>
                    </Box>
                    <Box display="flex">
                      <Typography variant="body2" color="textSecondary">
                        Longitud:
                      </Typography>
                      <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                        {selectedOficina.longitud}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded disableGutters>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="flujo-camiones-content"
                id="flujo-camiones-header"
                sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
              >
                <Typography variant="subtitle2" color="textPrimary">
                  <b>Flujo de camiones</b>
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
                <Box
                  sx={{
                    maxHeight: '300px', // Limitar la altura del contenedor
                    overflowY: 'auto', // Habilitar scroll vertical
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                {/* Camiones programados */}
                {scheduledVehicles.length > 0 && (
                  <>
                    {scheduledVehicles.map(({ vehicle, arrivalTime, deliveringOrders }: any) => (
                      <Box
                        key={vehicle.idVehiculo}
                        sx={{
                          backgroundColor: '#e3f2fd', // Azul claro para programado
                          padding: '8px',
                          borderRadius: '4px',
                          marginBottom: '8px',
                        }}
                      >
                        <Box display="flex" alignItems="center">
                          <LocalShipping sx={{ color: '#2196f3', marginRight: '8px' }} /> {/* Ícono de camión en azul */}
                          <Typography variant="subtitle1" color="textPrimary">
                            <b>Camión {vehicle.idVehiculo}</b>
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          <b>Estado:</b> Programado
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <b>Hora de llegada:</b>{' '}
                          {dayjs(arrivalTime).format('DD/MM/YYYY, hh:mm A')}
                        </Typography>
                        {deliveringOrders.length > 0 ? (
                          <>
                            <Typography variant="body2" color="textSecondary">
                              <b>Pedidos:</b>
                            </Typography>
                            <ul>
                              {deliveringOrders.map((pedido: Order) => (
                                <li key={pedido.idPedido}>
                                  <Typography variant="body2" color="textPrimary">
                                    Pedido {pedido.idPedido} - {pedido.cantidad} unidades
                                  </Typography>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            <b>Pedidos:</b> Ninguno
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </>
                )}

                {/* Camiones en mantenimiento */}
                {maintenanceVehicles.length > 0 && (
                  <>
                    {maintenanceVehicles.map((vehicle: Camion) => {
                      const timeRemainingMs =
                        vehicle.maintenance.startTime.getTime() +
                        vehicle.maintenance.duration -
                        state.currentTime.getTime();

                      const timeRemainingDuration = dayjs.duration(timeRemainingMs);
                      const hours = Math.floor(timeRemainingDuration.asHours());
                      const minutes = timeRemainingDuration.minutes();

                      const timeRemaining = `${hours}h ${minutes}m`;

                      // Obtener pedidos entregados en esa oficina antes del inicio del mantenimiento
                      const deliveredOrders = vehicle.ruta.pedidos.filter(
                        (pedido) =>
                          pedido.fechaLlegada &&
                          new Date(pedido.fechaLlegada) <= vehicle.maintenance.startTime &&
                          pedido.ubigeoDestino === selectedOficina.ubigeo
                      );

                      return (
                        <Box
                          key={vehicle.idVehiculo}
                          sx={{
                            backgroundColor: '#fff3e0', // Amarillo claro para mantenimiento
                            padding: '8px',
                            borderRadius: '4px',
                            marginBottom: '8px',
                          }}
                        >
                          <Box display="flex" alignItems="center">
                            <Build sx={{ color: '#ff9800', marginRight: '8px' }} /> {/* Ícono de mantenimiento en amarillo */}
                            <Typography variant="subtitle1" color="textPrimary">
                              <b>Camión {vehicle.idVehiculo}</b>
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            <b>Estado:</b> En mantenimiento ({timeRemaining} restantes)
                          </Typography>
                          {deliveredOrders.length > 0 ? (
                            <>
                              <Typography variant="body2" color="textSecondary">
                                <b>Pedidos entregados:</b>
                              </Typography>
                              <ul>
                                {deliveredOrders.map((pedido: Order) => (
                                  <li key={pedido.idPedido}>
                                    <Typography variant="body2" color="textPrimary">
                                      Pedido {pedido.idPedido} - {pedido.cantidad} unidades
                                    </Typography>
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              <b>Pedidos entregados:</b> Ninguno
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </>
                )}


                {/* Si no hay camiones programados ni en mantenimiento */}
                {scheduledVehicles.length === 0 && maintenanceVehicles.length === 0 && (
                  <Typography variant="body2" color="textSecondary">
                    No hay camiones programados o en mantenimiento
                  </Typography>
                )}
                </Box>
              </AccordionDetails>
            </Accordion>


          </>
        ) : (
          // Información de la simulación por defecto
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
                    <b>Información de la {operationType === 'diaadia' ? 'operación' : 'simulación'}</b>
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
            {/* Accordion para Detalles de camiones */}
            <Accordion defaultExpanded disableGutters>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel-camiones-content"
                id="panel-camiones-header"
                sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
              >
                <Typography variant="subtitle2" color="textPrimary">
                  <b>Detalles de camiones</b>
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
                {/* Contenido de Detalles de camiones */}
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
              </AccordionDetails>
            </Accordion>
            {/* Accordion para Detalles de pedidos */}
            <Accordion defaultExpanded disableGutters>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel-pedidos-content"
                id="panel-pedidos-header"
                sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
              >
                <Typography variant="subtitle2" color="textPrimary">
                  <b>Detalles de pedidos</b>
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
                {/* Contenido de Detalles de pedidos */}
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
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </div>
    </MapControl>
  );
};

export default PanelInformacion;
