// OfficeView.tsx
import React from 'react';
import { useData, useOperacionData } from '../../../../context/useData';
import {
  ExpandMore,
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
} from '@mui/material';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
import { Oficina } from '../../../../context/Simulacion/simulationTypes';
import { Vehicle as Camion, Order } from '../../../../context/Simulacion/simulationTypes';

interface OfficeViewProps {
  selectedOficina: Oficina;
}

type ScheduledVehicle = {
  vehicle: Camion;
  arrivalTime: Date;
  deliveringOrders: Order[];
  isArriving: boolean;
  isDeparting: boolean;
};

const OfficeView: React.FC<OfficeViewProps> = ({ selectedOficina }) => {
  // Intentar obtener el contexto de simulación primero
  let data;
  try {
    data = useData();
  } catch {
    // Si falla, usar el contexto de operación
    data = useOperacionData();
  }
  const { state } = data;

  // Calcular la carga actual
  const currentLoad = state.vehicles
          .flatMap((vehicle) => vehicle.ruta?.pedidos || [])
          .reduce((total, pedido) => {
            const perteneceOficina = pedido.ubigeoDestino === selectedOficina.ubigeo;
            const fechaLlegada = pedido.fechaLlegada ? new Date(pedido.fechaLlegada) : null;
            if (!perteneceOficina || !fechaLlegada) return total;
            const tiempoLimite = new Date(fechaLlegada.getTime() + 4 * 60 * 60 * 1000);
            const estaEnRango = state.currentTime >= fechaLlegada && state.currentTime <= tiempoLimite;
            return estaEnRango ? total + (pedido.cantidad || 0) : total;
          }, 0);

  const maxCapacity = selectedOficina?.almacen || 0;

  // Obtener camiones programados que llegarán o saldrán de esta ubicación
  const scheduledVehicles: ScheduledVehicle[] = state.vehicles
    .flatMap((vehicle) => {
      if (!vehicle.ruta || !vehicle.ruta.tramos || !vehicle.ruta.fechasLlegada || !vehicle.ruta.fechasSalida) return [];

      return vehicle.ruta.tramos
        .map((tramo, index) => {
          const isDestination = tramo?.destino?.codigo === selectedOficina.ubigeo;
          const isOrigin = tramo?.origen?.codigo === selectedOficina.ubigeo;

          // Solo procesar si es destino o si es origen y es un almacén
          if (!(isDestination || (isOrigin && selectedOficina.isAlmacen))) return null;

          const timeStr = isDestination
            ? vehicle.ruta.fechasLlegada[index]
            : vehicle.ruta.fechasSalida[index];

          const scheduledTime = timeStr ? new Date(timeStr) : null;

          if (scheduledTime && scheduledTime >= state.currentTime) {
            return {
              vehicle,
              arrivalTime: scheduledTime,
              deliveringOrders: vehicle.ruta.pedidos.filter(
                (pedido) => pedido.ubigeoDestino === selectedOficina.ubigeo
              ),
              isArriving: isDestination,
              isDeparting: isOrigin
            };
          }
          return null;
        })
        .filter(Boolean);
    })
    .filter(Boolean) as ScheduledVehicle[];

  // Obtener camiones en mantenimiento en la oficina seleccionada
  const maintenanceVehicles = state.vehicles.filter(
    (vehicle): vehicle is Camion & { maintenance: NonNullable<Camion['maintenance']>; } =>
      vehicle.maintenance !== undefined &&
      vehicle.maintenance.inMaintenance &&
      vehicle.maintenance.officeUbigeo === selectedOficina?.ubigeo
  );

  return (
    <Box
      sx={{
        maxHeight: '80vh', // Altura máxima para limitar el scroll
        overflowY: 'auto', // Habilita scroll vertical
      }}
    >
      {/* Información de la oficina seleccionada */}
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
              <b>Información de {selectedOficina.isAlmacen ? 'Almacén' : 'Oficina'}</b>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <b>{selectedOficina.isAlmacen ? 'Almacén' : 'Oficina'}:</b>{' '}
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
                {currentLoad}/{maxCapacity}
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Detalles de la oficina */}
      <Accordion defaultExpanded disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel-detalles-content"
          id="panel-detalles-header"
          sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
        >
          <Typography variant="subtitle2" color="textPrimary">
            <b>Detalles de {selectedOficina.isAlmacen ? 'Almacén' : 'Oficina'}</b>
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
                  OFC-{selectedOficina.ubigeo}
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

      {/* Flujo de camiones */}
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
                {scheduledVehicles.map(({ vehicle, arrivalTime, deliveringOrders, isArriving, isDeparting }) => (
                  <Box
                    key={`${vehicle.idVehiculo}-${arrivalTime.getTime()}`}
                    sx={{
                      backgroundColor: isDeparting ? '#e3f2fd' : '#f5f5f5', // Azul claro para salidas
                      padding: '8px',
                      borderRadius: '4px',
                      marginBottom: '8px',
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <LocalShipping
                        sx={{
                          color: isDeparting ? '#1976d2' : '#2196f3',
                          marginRight: '8px',
                          transform: isDeparting ? 'scaleX(-1)' : 'none' // Girar el icono para salidas
                        }}
                      />
                      <Typography variant="subtitle1" color="textPrimary">
                        <b>Camión {vehicle.idVehiculo}</b>
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      <b>Estado:</b> {isDeparting ? 'Programado para salir' : 'Programado para llegar'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <b>{isDeparting ? 'Hora de salida' : 'Hora de llegada'}:</b>{' '}
                      {dayjs(arrivalTime).format('DD/MM/YYYY, hh:mm A')}
                    </Typography>
                    {isArriving && deliveringOrders.length > 0 ? (
                      <>
                        <Typography variant="body2" color="textSecondary">
                          <b>Pedidos a entregar:</b>
                        </Typography>
                        <ul>
                          {deliveringOrders.map((pedido: Order) => (
                            <li key={pedido.idPedido}>
                              <Typography variant="body2" color="textPrimary">
                                {pedido.idPedido} ({pedido.cantidad} unidades)
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
                  const timeRemainingMs = Math.max(
                    0,
                    vehicle.maintenance!.startTime.getTime() +
                    vehicle.maintenance!.duration -
                    state.currentTime.getTime()
                  );
                  // Skip rendering if no time remaining
                  if (timeRemainingMs === 0) {
                    return null;
                  }
                  const timeRemainingDuration = dayjs.duration(timeRemainingMs);
                  const hours = Math.floor(timeRemainingDuration.asHours());
                  const minutes = timeRemainingDuration.minutes();

                  const timeRemaining = `${hours}h ${minutes}m`;

                  // Obtener pedidos entregados en esa oficina antes del inicio del mantenimiento
                  const deliveredOrders = vehicle.ruta.pedidos.filter(
                    (pedido) =>
                      pedido.fechaLlegada &&
                      new Date(pedido.fechaLlegada) <= vehicle.maintenance!.startTime &&
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
                        <Build sx={{ color: '#ff9800', marginRight: '8px' }} />{' '}
                        {/* Ícono de mantenimiento en amarillo */}
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
                                  {pedido.idPedido} ({pedido.cantidad} unidades)
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
    </Box>
  );
};

export default OfficeView;
