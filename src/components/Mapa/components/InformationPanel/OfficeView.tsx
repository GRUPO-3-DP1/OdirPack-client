// OfficeView.tsx
import React from 'react';
import { useData } from '../../../../context/useData';
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
};

const OfficeView: React.FC<OfficeViewProps> = ({ selectedOficina }) => {
  const { state } = useData();

  // Obtener datos de la oficina seleccionada
  const officeData = state.offices.find((office) => office.ubigeo === selectedOficina?.ubigeo);

  // Calcular la carga actual
  const currentLoad =
    officeData && officeData.currentOrders
      ? officeData.currentOrders.reduce(
          (total, currentOrder) => total + (currentOrder.order.cantidad || 0),
          0
        )
      : 'Ilimitado';

  const maxCapacity = selectedOficina?.almacen || 0;

  // Obtener camiones programados que llegarán a esta oficina
  const scheduledVehicles: ScheduledVehicle[] = state.vehicles
    .flatMap((vehicle) => {
      if (!vehicle.ruta || !vehicle.ruta.tramos || !vehicle.ruta.fechasLlegada) return [];
      return vehicle.ruta.tramos
        .map((tramo, index) => {
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
        })
        .filter(Boolean);
    })
    .filter(Boolean) as ScheduledVehicle[];

  // Obtener camiones en mantenimiento en la oficina seleccionada
  const maintenanceVehicles = state.vehicles.filter(
    (vehicle): vehicle is Camion & { maintenance: NonNullable<Camion['maintenance']> } =>
      vehicle.maintenance !== undefined &&
      vehicle.maintenance.inMaintenance &&
      vehicle.maintenance.officeUbigeo === selectedOficina?.ubigeo
  );

  return (
    <>
      {/* Información de la oficina seleccionada */}
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
              <b>Información de la oficina</b>
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

      {/* Detalles de la oficina */}
      <Accordion defaultExpanded disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel-detalles-content"
          id="panel-detalles-header"
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
                {scheduledVehicles.map(({ vehicle, arrivalTime, deliveringOrders }) => (
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
                      <LocalShipping sx={{ color: '#2196f3', marginRight: '8px' }} />{' '}
                      {/* Ícono de camión en azul */}
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
                  const timeRemainingMs =
                    vehicle.maintenance!.startTime.getTime() +
                    vehicle.maintenance!.duration -
                    state.currentTime.getTime();

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
    </>
  );
};

export default OfficeView;
