import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import { useOperacion } from '../../context/OperacionDia/useOperacion';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, FormControl, InputLabel, Select, MenuItem,
  SelectChangeEvent,
  TextField
} from '@mui/material';
import { Add, UploadFile } from '@mui/icons-material';
import ModalCargaMasiva from '../../components/Pedidos/ModalCargaMasiva';

const Page: React.FC = () => {
  const {fetchPedidos,pedidos} = useOperacion();

  const [tipo, setTipo] = useState<string>('');
  const [pedidoId, setPedidoId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal Carga Masiva

  const handlePedidoIdChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setPedidoId(event.target.value);
  };

  const handleChange = (event: SelectChangeEvent) => {
    setTipo(event.target.value);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchPedidos();
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  return (
    <div className={styles.contenedor}>
      <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={2}>
        {/* Input Número de Pedido*/}
        <FormControl size="small" sx={{ flex: 1, minWidth: '170px' }}>
          <TextField
            id="numero-pedido-input"
            label="Número De Pedido"
            variant="outlined"
            size="small"
            value={pedidoId}
            onChange={handlePedidoIdChange}
          />
        </FormControl>
        <FormControl size="small" sx={{ flex: 1, minWidth: '170px' }}>
          <InputLabel id="estado-label">Estado</InputLabel>
          <Select
            labelId="estado-label"
            id="estado-select"
            value={tipo}
            label="Estado"
            onChange={handleChange}
          >
            <MenuItem value="pendiente">Pending</MenuItem>
            <MenuItem value="entregado">Delivered</MenuItem>
          </Select>
        </FormControl>
        {/* Botón Nuevo Pedido */}
        <Button
          className={styles.button}
          variant="contained"
          onClick={()=>{}}
          startIcon= {<Add/>}
        > Nuevo Pedido </Button>
        {/* Botón Subir Archivo */}
        <Button
          className={styles.button}
          variant="contained"
          onClick={handleOpenModal}
          startIcon= {<UploadFile/>}
        > Subir Archivo </Button>
      </Box>

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
              <TableRow key={pedido.pedidoId}>
                <TableCell>{pedido.pedidoId}</TableCell>
                <TableCell>{pedido.cantidadTotal}</TableCell>
                <TableCell>{pedido.origenId}</TableCell>
                <TableCell>{pedido.destinoId}</TableCell>
                <TableCell>{formatDate(pedido.fechaRegistro)}</TableCell>
                <TableCell>{formatDate(pedido.fechaPlazoMaximo)}</TableCell>
                <TableCell>{pedido.estado}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {isModalOpen && <ModalCargaMasiva onClose={handleCloseModal}/>}
    </div>
  );
};

export default Page;

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // 24-hour format
  });
};
