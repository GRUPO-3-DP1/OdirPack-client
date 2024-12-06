// OrderView.tsx
import React from 'react';
import { useData } from '../../../../context/useData';
import {
  ExpandMore,
  Business,
  Inventory,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Box,
} from '@mui/material';
import dayjs from 'dayjs';
import { Order, Oficina } from '../../../../context/Simulacion/simulationTypes';
import oficinas from '../../../../data/oficinas';
import styles from './InformationPanel.module.css';

interface OrderViewProps {
  selectedPedido: Order;
}

const OrderView: React.FC<OrderViewProps> = ({ selectedPedido }) => {
  const { state } = useData();

  // Encontrar el camión asignado al pedido seleccionado
  const assignedTruck = state.vehicles.find(
    (vehicle) =>
      vehicle.ruta &&
      vehicle.ruta.pedidos.some((pedido) => pedido.idPedido === selectedPedido.idPedido)
  );

  // Crear una lista de visitas a oficinas
  let officeVisits: Array<{
    office: Oficina;
    status: string;
    arrivalTime: Date | null;
    departureTime: Date | null;
    unidadesEntregadas: number;
  }> = [];

  if (assignedTruck && assignedTruck.ruta) {
    const tramos = assignedTruck.ruta.tramos;
    const fechasLlegada = assignedTruck.ruta.fechasLlegada;
    const fechasSalida = assignedTruck.ruta.fechasSalida;

    officeVisits = tramos.map((tramo, index) => {
      const officeUbigeo = tramo.destino.codigo;
      const office = oficinas.find((office) => office.ubigeo === officeUbigeo);
      const arrivalTimeStr = fechasLlegada[index];
      const departureTimeStr = fechasSalida[index];
      const arrivalTime = arrivalTimeStr ? new Date(arrivalTimeStr) : null;
      const departureTime = departureTimeStr ? new Date(departureTimeStr) : null;

      // Determinar el pedidoStatus y unidades entregadas
      let status = 'Programado';
      const currentTime = state.currentTime;
      let unidadesEntregadas = 0;

      if (arrivalTime && currentTime >= arrivalTime) {
        // El camión ha llegado a la oficina
        if (selectedPedido.ubigeoDestino === officeUbigeo) {
          // Es la oficina de destino del pedido
          status = 'Entregado';
          unidadesEntregadas = selectedPedido.cantidad;
        } else {
          // No es la oficina de destino del pedido
          status = 'Visitado';
        }
      }

      return {
        office: office!,
        status,
        arrivalTime,
        departureTime,
        unidadesEntregadas,
      };
    });
  }

  return (
    <Box
      sx={{
        maxHeight: '80vh', // Altura máxima para limitar el scroll
        overflowY: 'auto', // Habilita scroll vertical
      }}
    >
      {/* Información del pedido */}
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
              <b>Información del pedido</b>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <b>Código:</b>{' '}
              <Typography component="span" variant="body2" color="textPrimary">
                {selectedPedido.idPedido}
              </Typography>
            </Typography>
          </div>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Inventory color="primary" sx={{ mb: 0.5 }} />
            <Typography variant="body2" color="textSecondary">
              <b>Estado:</b>{' '}
              {selectedPedido.fechaLlegada && state.currentTime >= new Date(selectedPedido.fechaLlegada)
                ? 'Entregado'
                : 'Pendiente'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Detalles del pedido */}
      <Accordion defaultExpanded disableGutters>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
        >
          <Typography variant="subtitle2" color="textPrimary">
            <b>Detalles del pedido</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
          <Box>
            <Typography variant="body2" color="textSecondary">
              <b>Cantidad:</b> {selectedPedido.cantidad} unidades
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <b>Fecha de registro:</b>{' '}
              {dayjs(selectedPedido.fechaRegistro).format('DD/MM/YYYY, hh:mm A')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <b>Plazo máximo:</b>{' '}
              {dayjs(selectedPedido.fechaLlegada).format('DD/MM/YYYY, hh:mm A')}
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="textSecondary">
                <b>Destino:</b>{' '}
                {`${oficinas.find((o) => o.ubigeo === selectedPedido.ubigeoDestino)?.departamento}, ${oficinas.find((o) => o.ubigeo === selectedPedido.ubigeoDestino)?.provincia}`}
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Camión asignado */}
      {assignedTruck && (
        <Accordion defaultExpanded disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
          >
            <Typography variant="subtitle2" color="textPrimary">
              <b>Camión asignado</b>
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                <b>Código:</b> {assignedTruck.idVehiculo}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <b>Hora de salida:</b>{' '}
                {dayjs(assignedTruck.ruta.fechasSalida[0]).format('DD/MM/YYYY, hh:mm A')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <b>Hora de entrega:</b>{' '}
                {dayjs(selectedPedido.fechaLlegada).format('DD/MM/YYYY, hh:mm A')}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Oficinas en la ruta */}
      {assignedTruck && officeVisits.length > 0 && (
        <Accordion defaultExpanded disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ minHeight: '0', padding: '0 16px', margin: 0 }}
          >
            <Typography variant="subtitle2" color="textPrimary">
              <b>Ruta del pedido</b>
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '8px 16px', pt: 0 }}>
            <Box className={styles.routeBox}>
              {officeVisits.map((visit, index) => {
                const { office, status, arrivalTime, departureTime, unidadesEntregadas } = visit;

                let cardColor = '';
                switch (status) {
                  case 'Programado':
                    cardColor = '#F5F5F5'; // Gris más claro y suave
                    break;
                  case 'Visitado':
                    cardColor = '#DCEEFF'; // Azul claro más apagado
                    break;
                  case 'Entregado':
                    cardColor = '#D4EFD9'; // Verde claro más tenue
                    break;
                  default:
                    cardColor = '#FFFFFF'; // Blanco por defecto
                }

                return (
                  <Box
                    key={index}
                    sx={{
                      backgroundColor: cardColor,
                      padding: '8px',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      display: 'flex', // Alinear ítems horizontalmente
                      alignItems: 'flex-start', // Alinear verticalmente al inicio
                    }}
                  >
                    {/* Ícono alineado a la izquierda */}
                    <Business sx={{ color: '#616161', marginRight: '8px', marginTop: '4px' }} />
                    <Box>
                      <Typography variant="body2" color="textPrimary">
                        <b>
                          {office.departamento}, {office.provincia}&nbsp;-&nbsp;{status}
                        </b>
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <b>Llegada:</b>{' '}
                        {arrivalTime ? dayjs(arrivalTime).format('DD/MM/YYYY, hh:mm A') : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <b>Salida:</b>{' '}
                        {departureTime ? dayjs(departureTime).format('DD/MM/YYYY, hh:mm A') : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <b>Unidades entregadas:</b> {unidadesEntregadas}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

export default OrderView;
