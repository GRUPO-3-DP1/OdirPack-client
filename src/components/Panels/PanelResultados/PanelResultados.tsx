import React, { useEffect, useState } from 'react';
import PanelBase from '../PanelBase/PanelBase';
import { ControlPosition } from '@vis.gl/react-google-maps';
import styles from './PanelResultados.module.css';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useSimulation } from '../../../context/Simulacion/useSimulation';
import { PedidoAlgorithmResponse, ResponseAlgorithm } from '../../../store/types/ResponseAlgorithm';
import MapIcon from '@mui/icons-material/Map';

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
};

const PanelResultados: React.FC<PanelResultadosProps> = ({ show = true }) => {
  const { solutions } = useSimulation();

  const [pedidos, setPedidos] = useState<PedidoTableRow[]>([]);
  const [rutas, setRutas] = useState<RutaTableRow[]>([]);
  /* const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('idPedido');

  const handleSortRequest = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }; */

  // Extraer Pedidos
  useEffect(() => {
    const pedidosData = extractAllPedidos(solutions).map((pedido) => ({
      idPedido: pedido.idPedido,
      cantidad: pedido.cantidad,
      origen: pedido.ubigeoOrigen ? pedido.ubigeoOrigen : "Desconocido",
      destino: pedido.ubigeoDestino,
      fechaRegistro: pedido.fechaRegistro,
      fechaPlazoMaximo: pedido.fechaPlazoMaximo,
      estado: pedido.estado ? pedido.estado : "No Planificado",
    }));

    // Extraer las rutas
    const rutasData = extractAllRutas(solutions).map((ruta) => ({
      idRuta: ruta.idRuta,
      placa: ruta.placa,
      origen: ruta.origen ? ruta.origen : "Desconocido",
      fechaInicio: ruta.fechaInicio,
      cantidadPedidos: ruta.cantidadPedidos,
    }));
    setPedidos(pedidosData);
    setRutas(rutasData);
  }, [solutions]);

  return (
    <PanelBase show={true} position={ControlPosition.CENTER}>
      <div className={styles.container}>
        <div className={styles.title}>Pedidos</div>
        <TableContainer component={Paper} className={styles.tableContainer}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className={styles.tableCell}>Número de Pedido</TableCell>
                <TableCell className={styles.tableCell}>Cantidad De Paquetes</TableCell>
                <TableCell className={styles.tableCell}>Origen</TableCell>
                <TableCell className={styles.tableCell}>Destino</TableCell>
                <TableCell className={styles.tableCell}>Fecha De Registro</TableCell>
                <TableCell className={styles.tableCell}>Fecha Plazo Máximo</TableCell>
                <TableCell className={styles.tableCell}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={styles.scrollableBody}>
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
                <TableCell className={styles.tableCell}>Número De Ruta</TableCell>
                <TableCell className={styles.tableCell}>Número De Placa</TableCell>
                <TableCell className={styles.tableCell}>Origen</TableCell>
                <TableCell className={styles.tableCell}>Fecha De Inicio</TableCell>
                <TableCell className={styles.tableCell}>Número De Paquetes</TableCell>
                <TableCell className={styles.tableCell}>Tramos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={styles.scrollableBody}>
              {rutas.map((ruta) => (
                <TableRow key={ruta.idRuta}>
                  <TableCell>{ruta.idRuta}</TableCell>
                  <TableCell>{ruta.placa}</TableCell>
                  <TableCell>{ruta.origen}</TableCell>
                  <TableCell>{formatDate(ruta.fechaInicio)}</TableCell>
                  <TableCell>{ruta.cantidadPedidos}</TableCell>
                  <TableCell>{<MapIcon fontSize="small" color="primary" />}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </PanelBase >
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
  const allRutas: { idRuta: string; fechaInicio: string; placa: string; origen: string; cantidadPedidos: number; }[] = [];

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
              origen: "LIMA",
              cantidadPedidos: cantidadPedidos
            }];
          }
        }
        return [];
      });
    });

    // Agregar o actualizar las rutas en la lista total
    rutas.forEach(ruta => {
      const existingRuta = allRutas.find(r => r.fechaInicio === ruta.fechaInicio && r.placa === ruta.placa);

      if (existingRuta) {
        // Si la ruta ya existe, sumar la cantidad de pedidos
        existingRuta.cantidadPedidos += ruta.cantidadPedidos;
      } else {
        // Si no existe, agregarla a la lista con un nuevo ID
        allRutas.push(ruta);
      }
    });
  });

  return allRutas;
};