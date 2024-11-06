// PanelInformacion.tsx
import { ControlPosition, MapControl } from '@vis.gl/react-google-maps';
import React, { useState } from 'react';
import { useSimulation } from '../../../../../../../context/Simulacion/useSimulation';
import {
  ExpandMore,
  AccessTimeFilled,
  Business,
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
  CircularProgress, // Importamos CircularProgress para el indicador de carga
} from '@mui/material';
import dayjs from 'dayjs';
import duration, { Duration } from 'dayjs/plugin/duration';
import styles from './PanelInformacion.module.css';

dayjs.extend(duration);

import { Oficina } from '../../Markers/OficinaMarker/OficinaMarker';
import { Vehicle as Camion } from '../../../../../../../context/Simulacion/simulationTypes';
import { OficinaData } from '../../../../../../../store/services/oficinas'; // Importamos OficinaData

interface PanelInformacionProps {
  show: boolean;
  selectedOficina: Oficina | null;
  selectedCamion: Camion | null;
  operationType: 'semanal' | 'colapso' | 'diaadia';
  oficinaData: OficinaData | null; // Añadimos oficinaData
  loadingOficinaData: boolean;     // Añadimos loadingOficinaData
}

const PanelInformacion: React.FC<PanelInformacionProps> = ({
  show,
  selectedOficina,
  oficinaData,
  loadingOficinaData,
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
    totalOffices,
    occupiedOffices,
    ordersDelivered,
    ordersPending,
    startTime,
    currentTime,
    endTime,
  } = state;

  const totalTime = endTime.getTime() - startTime.getTime();
  const elapsedTime = currentTime.getTime() - startTime.getTime();
  const progressPercentage = Math.floor((elapsedTime / totalTime) * 100);

  const fleetSaturation = `${trucksInMotion + trucksInMaintenance} / ${totalTrucks}`;
  const officeSaturation = `${occupiedOffices} / ${totalOffices}`;

  const elapsedDuration = dayjs.duration(elapsedTime);
  const formattedElapsedTime = formatElapsedTime(elapsedDuration);

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
                    <b>Información del Camión</b>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <b>Código del Camión:</b>{' '}
                    <Typography component="span" variant="body2" color="textPrimary">
                      {selectedCamion.idVehiculo}
                    </Typography>
                  </Typography>
                </div>
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
                        Código:
                      </Typography>
                      <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                        CMN-{selectedCamion.idVehiculo}
                      </Typography>
                    </Box>
                    <Box display="flex">
                      <Typography variant="body2" color="textSecondary">
                        Tipo Camión:
                      </Typography>
                      <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                        {selectedCamion.idVehiculo}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex">
                      <Typography variant="body2" color="textSecondary">
                        Velocidad Máxima:
                      </Typography>
                      <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                        {selectedCamion.idVehiculo}
                      </Typography>
                    </Box>
                    <Box display="flex">
                      <Typography variant="body2" color="textSecondary">
                        Capacidedad Carga:
                      </Typography>
                      <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                        {selectedCamion.idVehiculo}
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
                <Typography variant="subtitle2" color="textPrimary">
                  <b>Registrar Avería</b>
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel id="tipo-averia-label">Tipo de Avería</InputLabel>
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
                    // Aquí puedes manejar la lógica para registrar la avería, por ejemplo, hacer una solicitud al servidor
                  }}
                >
                  Registrar Avería
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
                    <b>Información oficina</b>
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
                  {loadingOficinaData ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      <b>Carga:</b>{' '}
                      <Typography component="span" variant="body2" color="textPrimary">
                        {oficinaData ? `${oficinaData.cargaPorcentaje}%` : 'N/A'}
                      </Typography>
                    </Typography>
                  )}
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
            <Accordion defaultExpanded disableGutters>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel3-content"
                id="panel3-header"
                sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
              >
                <Typography variant="subtitle2" color="textPrimary">
                  <b>Operación</b>
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
                {loadingOficinaData ? (
                  <Box display="flex" justifyContent="center">
                    <CircularProgress />
                  </Box>
                ) : oficinaData ? (
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Cantidad de paquetes:{' '}
                      <Typography component="span" variant="body2" color="textPrimary">
                        {oficinaData.cantidadPaquetes} / {oficinaData.capacidadTotal} ({oficinaData.cargaPorcentaje}%)
                      </Typography>
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Cantidad de paquetes recibidos:{' '}
                      <Typography component="span" variant="body2" color="textPrimary">
                        {oficinaData.paquetesRecibidos}
                      </Typography>
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No se pudo obtener la información de la oficina.
                  </Typography>
                )}
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
                      {operationType === 'semanal' ? 'Semanal' : operationType === 'colapso' ? 'Hasta el colapso' : 'Día a día'}
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
                  {/* Mismo contenido que en PanelPrincipal */}
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

                  {/* Sección Camiones */}
                  <Typography variant="subtitle2" color="textPrimary" sx={{ mt: 1 }}>
                    <b>Camiones</b>
                  </Typography>
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

                  {/* Sección Oficinas */}
                  <Typography variant="subtitle2" color="textPrimary" sx={{ mt: 1 }}>
                    <b>Oficinas</b>
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Saturación de oficinas:{' '}
                    <Typography component="span" variant="body2" color="textPrimary">
                      {officeSaturation}
                    </Typography>
                  </Typography>

                  {/* Sección Pedidos */}
                  <Typography variant="subtitle2" color="textPrimary" sx={{ mt: 1 }}>
                    <b>Pedidos</b>
                  </Typography>
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
                </Box>
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </div >
    </MapControl >
  );
};

export default PanelInformacion;
