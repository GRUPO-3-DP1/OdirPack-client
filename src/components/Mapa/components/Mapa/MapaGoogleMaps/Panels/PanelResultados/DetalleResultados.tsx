import React, { useEffect, useState } from 'react';
import { useData } from '../../../../../../../context/useData';
import { PedidoAlgorithmResponse, ResponseAlgorithm, TramoAlgorithmResponse } from '../../../../../../../store/types/ResponseAlgorithm';

import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Stack, 
  Box 
} from '@mui/material';

import { Close as CloseIcon, ArrowBack as ArrowBackIcon, AddRoad } from '@mui/icons-material';

interface DetalleResultadosProps {
  show?: boolean;
  onClose?: () => void;
}

type PedidoTableRow = {
  idPedido: string;
  cantidad: number;
  origen: string;
  destino: string;
  fechaRegistro: string;
  fechaPlazoMaximo: string;
  estado: string;
};

type RutaTableRow = {
  idRuta: string;
  placa: string;
  fechaInicio: string;
  cantidadPedidos: number;
  origen: string;
  tramos: TramoAlgorithmResponse[];
};

const DetalleResultados: React.FC<DetalleResultadosProps> = ({ show = true, onClose }) => {
  const { solutions } = useData();
  const [pedidos, setPedidos] = useState<PedidoTableRow[]>([]);
  const [rutas, setRutas] = useState<RutaTableRow[]>([]);
  const [mostrarTramos, setMostrarTramos] = useState(false);
  const [tramosSeleccionados, setTramosSeleccionados] = useState<TramoAlgorithmResponse[]>([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaTableRow | null>(null);

  useEffect(() => {
    const pedidosData = extractAllPedidos(solutions).map((pedido) => ({
      idPedido: pedido.idPedido,
      cantidad: pedido.cantidad,
      origen: pedido.ubigeoOrigen || "Desconocido",
      destino: pedido.ubigeoDestino,
      fechaRegistro: pedido.fechaRegistro,
      fechaPlazoMaximo: pedido.fechaPlazoMaximo,
      estado: pedido.estado || "No Planificado",
    }));

    const rutasData = extractAllRutas(solutions).map((ruta) => ({
      idRuta: ruta.idRuta,
      placa: ruta.placa,
      origen: ruta.origen || "Desconocido",
      fechaInicio: ruta.fechaInicio,
      cantidadPedidos: ruta.cantidadPedidos,
      tramos: ruta.tramos
    }));

    setPedidos(pedidosData);
    setRutas(rutasData);
  }, [solutions]);

  const handleMostrarTramos = (tramos: TramoAlgorithmResponse[], ruta: RutaTableRow) => {
    setTramosSeleccionados(tramos);
    setRutaSeleccionada(ruta);
    setMostrarTramos(true);
  };

  const handleVolver = () => {
    setMostrarTramos(false);
    setTramosSeleccionados([]);
    setRutaSeleccionada(null);
  };

  if (!show) return null;

  return (
    <Dialog
      open={show}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', position: 'relative', fontWeight: 'bold' }}>
        {mostrarTramos ? (
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
            <Button 
              variant="text" 
              startIcon={<ArrowBackIcon />} 
              onClick={handleVolver}
              sx={{ position: 'absolute', left: 8 }}
            >
              Volver
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Tramos</Typography>
          </Stack>
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Detalle de Resultados</Typography>
        )}

        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ padding: 3 }}>
        {!mostrarTramos ? (
          <Stack spacing={4}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign:'center' }}>Pedidos</Typography>
              <Stack spacing={2} sx={{ maxHeight: '40vh', overflowY: 'auto' }}>
                {pedidos.length > 0 ? (
                  pedidos.map((pedido) => (
                    <Card key={pedido.idPedido} variant="outlined">
                      <CardContent sx={{ fontSize: 15 }}>
                        <Box sx={{ mb: 1 }}><strong>Código:</strong> {pedido.idPedido}</Box>
                        <Box sx={{ mb: 1 }}><strong>Paquetes:</strong> {pedido.cantidad}</Box>
                        <Box sx={{ mb: 1 }}><strong>Origen:</strong> {pedido.origen}</Box>
                        <Box sx={{ mb: 1 }}><strong>Destino:</strong> {pedido.destino}</Box>
                        <Box sx={{ mb: 1 }}><strong>Registro:</strong> {formatDate(pedido.fechaRegistro)}</Box>
                        <Box sx={{ mb: 1 }}><strong>Plazo máximo:</strong> {formatDate(pedido.fechaPlazoMaximo)}</Box>
                        <Box><strong>Estado:</strong> {pedido.estado}</Box>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No hay pedidos disponibles.
                  </Typography>
                )}
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign:'center' }}>Rutas</Typography>
              <Stack spacing={2} sx={{ maxHeight: '40vh', overflowY: 'auto' }}>
                {rutas.length > 0 ? (
                  rutas.map((ruta) => (
                    <Card key={ruta.idRuta} variant="outlined">
                      <CardContent sx={{ fontSize: 15 }}>
                        <Box sx={{ mb: 1 }}><strong>Ruta:</strong> {ruta.idRuta}</Box>
                        <Box sx={{ mb: 1 }}><strong>Placa:</strong> {ruta.placa}</Box>
                        <Box sx={{ mb: 1 }}><strong>Origen:</strong> {ruta.origen}</Box>
                        <Box sx={{ mb: 1 }}><strong>Inicio:</strong> {formatDate(ruta.fechaInicio)}</Box>
                        <Box sx={{ mb: 1 }}><strong>Paquetes:</strong> {ruta.cantidadPedidos}</Box>
                        <Box sx={{ display:'flex', alignItems:'center' }}>
                          <strong>Tramos:</strong>
                          <Button 
                            variant="contained" 
                            size="small" 
                            startIcon={<AddRoad />} 
                            onClick={() => handleMostrarTramos(ruta.tramos, ruta)}
                            sx={{ ml: 2, textTransform:'none' }}
                          >
                            Ver tramos
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No hay rutas disponibles.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        ) : (
          <>
            {rutaSeleccionada && (
              <Box sx={{ mb: 3, textAlign:'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight:'bold', mb:1 }}>
                  Ruta: {rutaSeleccionada.idRuta}
                </Typography>
                <Typography variant="body2">
                  <strong>Placa:</strong> {rutaSeleccionada.placa} | <strong>Paquetes:</strong> {rutaSeleccionada.cantidadPedidos}
                </Typography>
              </Box>
            )}

            <Stack spacing={2} sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {tramosSeleccionados.length > 0 ? (
                tramosSeleccionados.map((tramo, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent sx={{ fontSize: 15 }}>
                      <Box sx={{ mb: 1 }}><strong>Origen:</strong> {tramo.origen.descripcion}</Box>
                      <Box sx={{ mb: 1 }}><strong>Destino:</strong> {tramo.destino.descripcion}</Box>
                      <Box sx={{ mb: 1 }}><strong>Salida:</strong> 21/10/2024, 06:00:00</Box>
                      <Box><strong>Llegada:</strong> 21/10/2024, 08:00:00</Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  No hay tramos disponibles.
                </Typography>
              )}
            </Stack>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetalleResultados;

function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  return date.toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function extractAllPedidos(solutions: ResponseAlgorithm[]) {
  const allPedidos: PedidoAlgorithmResponse[] = [];

  solutions.forEach(solution => {
    const planificadosPedidos = solution.solucion.flatMap(solucionItem => {
      if (!solucionItem.rutasVehiculos) return [];
      return Object.values(solucionItem.rutasVehiculos).flatMap(vehicleItem => {
        if (vehicleItem && vehicleItem.ruta) {
          return (vehicleItem.ruta.pedidos || []).map(pedido => ({
            ...pedido,
            ubigeoOrigen: vehicleItem.ruta ? vehicleItem.ruta.tramos[0].origen.descripcion : null,
            estado: 'Planificado'
          }));
        }
        return [];
      });
    });

    planificadosPedidos.forEach(pedido => {
      const existingPedido = allPedidos.find(p => p.idPedido === pedido.idPedido);
      if (existingPedido) {
        existingPedido.cantidad += pedido.cantidad;
      } else {
        allPedidos.push(pedido);
      }
    });
  });

  return allPedidos;
}

let lastIdNumber = 0;
function generateRouteId() {
  lastIdNumber += 1;
  return `R${lastIdNumber.toString().padStart(3, '0')}`;
}

function extractAllRutas(solutions: ResponseAlgorithm[]) {
  const allRutas: { idRuta: string; fechaInicio: string; placa: string; origen: string; cantidadPedidos: number; tramos: TramoAlgorithmResponse[]}[] = [];

  lastIdNumber = 0;

  solutions.forEach(solution => {
    const rutas = solution.solucion.flatMap(solucionItem => {
      if (!solucionItem.rutasVehiculos) return [];
      return Object.values(solucionItem.rutasVehiculos).flatMap(vehicleItem => {
        if (vehicleItem && vehicleItem.ruta) {
          const cantidadPedidos = (vehicleItem.ruta.pedidos || []).reduce((total, pedido) => total + (pedido.cantidad || 0), 0);
          if (cantidadPedidos > 0) {
            return [{
              idRuta: generateRouteId(),
              fechaInicio: vehicleItem.ruta.fechaInicio,
              placa: vehicleItem.idVehiculo,
              origen: vehicleItem.ruta.tramos[0].origen.descripcion,
              cantidadPedidos: cantidadPedidos,
              tramos: vehicleItem.ruta.tramos,
            }];
          }
        }
        return [];
      });
    });
    rutas.forEach(ruta => {
      allRutas.push(ruta);
    });
  });

  return allRutas;
}
