// PanelInformacion.tsx
import { ControlPosition, MapControl } from '@vis.gl/react-google-maps';
import React, { useState } from 'react';
import { useSimulation } from '../../../../../../../context/Simulacion/useSimulation';
import {
  ExpandMore,
  AccessTimeFilled,
  Business,
  LocalShipping,
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
import duration, { Duration } from 'dayjs/plugin/duration';
import styles from './PanelInformacion.module.css';
import useAveria from '../../../../../../../store/hooks/useAveria'; // Asegúrate de que la ruta sea correcta
import { Averia } from '../../../../../../../store/types/Averia'; // Importa el tipo Averia


dayjs.extend(duration);

import { Oficina } from '../../../../../../../context/Simulacion/simulationTypes';
import { Vehicle as Camion } from '../../../../../../../context/Simulacion/simulationTypes';

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
  //const { registerAveria, loading, error } = useAveria();


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
  const currentLoad = officeData ? (officeData.currentOrders?.length ?? 'N/A') : 'N/A';
  const maxCapacity = 60;

  const totalTime = endTime.getTime() - startTime.getTime();
  const elapsedTime = currentTime.getTime() - startTime.getTime();
  const progressPercentage = Math.floor((elapsedTime / totalTime) * 100);

  const fleetSaturation = `${trucksInMotion + trucksInMaintenance} / ${totalTrucks}`;
  //const officeSaturation = `${occupiedOffices} / ${totalOffices}`;

  const elapsedDuration = dayjs.duration(elapsedTime);
  const formattedElapsedTime = formatElapsedTime(elapsedDuration);

  const currentCamionLoad = Array.isArray(selectedCamion?.ruta?.pedidos ?? [])
  ? (selectedCamion?.ruta?.pedidos ?? []).reduce((total, pedido) => total + pedido.cantidad, 0)
  : 0;


  function formatElapsedTime(elapsedDuration: Duration): string {
    const totalSeconds = elapsedDuration.asSeconds();
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let formatted = '';
    if (days > 0) {
      formatted += `${days}d `;
    }
    formatted += `${hours}h ${minutes}m`;

    return formatted.trim();
  }

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
    if (origenRegion === 'SELVA' && destinoRegion === 'SIERRA') return 65;
    if (origenRegion === 'SELVA' && destinoRegion === 'COSTA') return 65;
    // Puedes agregar más condiciones según sea necesario
    return 55; // Valor por defecto si no se encuentra una coincidencia
  };

  const getMaxSpeedForCamion = (camion: Camion) => {
    if (camion.ruta.pedidos.length > 0) {
      const pedido = camion.ruta.pedidos[0]; // Suponiendo que tomamos el primer pedido
      const origen = state.offices.find((office) => office.ubigeo === pedido.ubigeoOrigen);
      const destino = state.offices.find((office) => office.ubigeo === pedido.ubigeoDestino);
      if (origen && destino) {
        return getMaxSpeed(origen.regionNatural, destino.regionNatural);
      }
    }
    return '55';
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
                      {currentCamionLoad}/{selectedCamion.capacidadCarga}
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
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
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
                </Box>
              </AccordionDetails>
            </Accordion>
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
                    <MenuItem value="tipo1">Tipo 1: Avería moderada</MenuItem>
                    <MenuItem value="tipo2">Tipo 2: Avería fuerte</MenuItem>
                    <MenuItem value="tipo3">Tipo 3: Avería Siniestra</MenuItem>
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
                    <b>Carga:</b>{' '}
                    <Typography component="span" variant="body2" color="textPrimary">
                      {currentLoad !== 'N/A' ? `${currentLoad}/${maxCapacity}` : 'N/A'}
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
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
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
                </Box>
              </AccordionDetails>
            </Accordion>
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
            {/* Accordion para Detalles de simulación */}
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
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
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
