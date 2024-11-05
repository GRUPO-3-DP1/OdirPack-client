import React, { useEffect, useState } from 'react';
import PanelBase from '../PanelBase/PanelBase';
import { ControlPosition } from '@vis.gl/react-google-maps';
import styles from './PanelResultados.module.css';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { useSimulation } from '../../../context/Simulacion/useSimulation';
import { PedidoAlgorithmResponse, ResponseAlgorithm, TramoAlgorithmResponse } from '../../../store/types/ResponseAlgorithm';
import { AddRoad } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

type PanelResultadosProps = {
  show?: boolean;
};

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

const PanelResultados: React.FC<PanelResultadosProps> = ({ show = true }) => {
  const { solutions } = useSimulation();
  const [pedidos, setPedidos] = useState<PedidoTableRow[]>([]);
  const [rutas, setRutas] = useState<RutaTableRow[]>([]);
  const [mostrarTramos, setMostrarTramos] = useState(false);
  const [tramosSeleccionados, setTramosSeleccionados] = useState<TramoAlgorithmResponse[]>([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaTableRow | null>(null);

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

  // Extract Pedidos and Rutas from solutions
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

  return (
    <>
      {mostrarTramos ? (
        // Display the Tramos panel when mostrarTramos is true
        <PanelBase show={show} position={ControlPosition.CENTER}>
          <div className={styles.container}>
            <div className={styles.headerContainer}>
              <IconButton onClick={handleVolver} color="primary" className={styles.backButton}>
                <ArrowBackIcon />
              </IconButton>
              <div className={styles.title}>Tramos</div>
            </div>
              {rutaSeleccionada && (
                <div className={styles.routeInfo}>
                  <div><strong>Número de Ruta:</strong> {rutaSeleccionada.idRuta}</div>
                  <div><strong>Número de Placa:</strong> {rutaSeleccionada.placa}</div>
                  <div><strong>Número de Paquetes:</strong> {rutaSeleccionada.cantidadPedidos}</div>
                </div>
              )}
            <TableContainer component={Paper} className={styles.tableContainer}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Origen</TableCell>
                    <TableCell>Destino</TableCell>
                    <TableCell>Fecha Salida</TableCell>
                    <TableCell>Fecha Llegada</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tramosSeleccionados.map((tramo, index) => (
                    <TableRow key={index}>
                      <TableCell>{tramo.origen.descripcion}</TableCell>
                      <TableCell>{tramo.destino.descripcion}</TableCell>
                      <TableCell>{"21/10/2024, 06:00:00"}</TableCell>
                      <TableCell>{"21/10/2024, 08:00:00"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </PanelBase>
      ) : (
        // Display the main Pedidos and Rutas panel when mostrarTramos is false
        <PanelBase show={show} position={ControlPosition.CENTER}>
          <div className={styles.container}>
            <div className={styles.title}>Pedidos</div>
            <TableContainer component={Paper} className={styles.tableContainer}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Número de Pedido</TableCell>
                    <TableCell>Cantidad De Paquetes</TableCell>
                    <TableCell>Origen</TableCell>
                    <TableCell>Destino</TableCell>
                    <TableCell>Fecha De Registro</TableCell>
                    <TableCell>Fecha Plazo Máximo</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedidos.map((pedido) => (
                    <TableRow key={pedido.idPedido}>
                      <TableCell>{pedido.idPedido}</TableCell>
                      <TableCell>{pedido.cantidad}</TableCell>
                      <TableCell>{pedido.origen}</TableCell>
                      <TableCell>{pedido.destino}</TableCell>
                      <TableCell>{formatDate(pedido.fechaRegistro)}</TableCell>
                      <TableCell>{formatDate(pedido.fechaPlazoMaximo)}</TableCell>
                      <TableCell>{pedido.estado}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <div className={styles.title}>Rutas</div>
            <TableContainer component={Paper} className={styles.tableContainer}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Número De Ruta</TableCell>
                    <TableCell>Número De Placa</TableCell>
                    <TableCell>Origen</TableCell>
                    <TableCell>Fecha De Inicio</TableCell>
                    <TableCell>Número De Paquetes</TableCell>
                    <TableCell>Tramos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rutas.map((ruta) => (
                    <TableRow key={ruta.idRuta}>
                      <TableCell>{ruta.idRuta}</TableCell>
                      <TableCell>{ruta.placa}</TableCell>
                      <TableCell>{ruta.origen}</TableCell>
                      <TableCell>{formatDate(ruta.fechaInicio)}</TableCell>
                      <TableCell>{ruta.cantidadPedidos}</TableCell>
                      <TableCell>
                        <AddRoad fontSize="small" color="primary" onClick={() => handleMostrarTramos(ruta.tramos, ruta)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            </div>
            <div className={styles.buttonContainer}>
              <Button
                variant='contained'
                className={styles.buttton}
                onClick={() => {}}
              >
                Salir
              </Button>
            </div>
          </PanelBase>
        )}
      </>
  );
};

export default PanelResultados;


const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // Formato de 24 horas
  });
};

const extractAllPedidos = (solutions: ResponseAlgorithm[]) => {
  const allPedidos: PedidoAlgorithmResponse[] = [];

  // Iterar sobre todas las soluciones
  solutions.forEach(solution => {
    const planificadosPedidos = solution.solucion.flatMap(solucionItem => {
      if (!solucionItem.rutasVehiculos) return [];

      return Object.values(solucionItem.rutasVehiculos).flatMap(vehicleItem => {
        if (vehicleItem && vehicleItem.ruta) {
          return (vehicleItem.ruta.pedidos || []).map(pedido => ({
            ...pedido,
            ubigeoOrigen: vehicleItem.ruta? vehicleItem.ruta.tramos[0].origen.descripcion: null,
            estado: 'Planificado'
          }));
        }
        return [];
      });
    });

    // Agregar o actualizar los pedidos en la lista total
    planificadosPedidos.forEach(pedido => {
      const existingPedido = allPedidos.find(p => p.idPedido === pedido.idPedido);

      if (existingPedido) {
        // Si el pedido ya existe, sumar la cantidad
        existingPedido.cantidad += pedido.cantidad;
      } else {
        // Si no existe, agregarlo a la lista
        allPedidos.push(pedido);
      }
    });
  });

  return allPedidos;
};

// Generador de ID para rutas
let lastIdNumber = 0;

const generateRouteId = () => {
  lastIdNumber += 1;
  return `R${lastIdNumber.toString().padStart(3, '0')}`;
};


const extractAllRutas = (solutions: ResponseAlgorithm[]) => {
  const allRutas: { idRuta: string; fechaInicio: string; placa: string; origen: string; cantidadPedidos: number; tramos: TramoAlgorithmResponse[]}[] = [];

  // Reiniciar el contador de IDs al inicio de la función
  lastIdNumber = 0;

  // Iterar sobre todas las soluciones
  solutions.forEach(solution => {
    const rutas = solution.solucion.flatMap(solucionItem => {
      if (!solucionItem.rutasVehiculos) return [];

      return Object.values(solucionItem.rutasVehiculos).flatMap(vehicleItem => {
        if (vehicleItem && vehicleItem.ruta) {
          // Calcular la cantidad total de paquetes en esta ruta
          const cantidadPedidos = (vehicleItem.ruta.pedidos || []).reduce((total, pedido) => total + (pedido.cantidad || 0), 0);

          if (cantidadPedidos > 0) {
            return [{
              idRuta: generateRouteId(), // Generar un ID único para cada ruta
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

    // Agregar rutas en la lista total
    rutas.forEach(ruta => {
        allRutas.push(ruta);
    });
  });

  return allRutas;
};