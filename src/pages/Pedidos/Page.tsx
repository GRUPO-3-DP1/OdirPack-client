import React, { useEffect, useState } from 'react';
import usePedidos from '../../store/hooks/usePedidos';
import styles from './page.module.css';
import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { Add, UploadFile } from '@mui/icons-material';
import ModalCargaMasiva from './Componentes/ModalCargaMasiva';
import { formatDate } from '../../utils/formatDate';
import CreatePedidoDialog from './Componentes/CreatePedidoDialog';

const Page: React.FC = () => {
  const { pedidos, fetchPedidos } = usePedidos();

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const [tipo, setTipo] = useState<string>('');
  const [pedidoId, setPedidoId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal Carga Masiva
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handlePedidoIdChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setPedidoId(event.target.value);
  };

  // Filtrar pedidos por pedidoId y estado (tipo)
  const pedidosFiltrados = pedidos.filter((pedido) =>
    (pedidoId ? pedido.pedidoId?.toString().includes(pedidoId.toString()) : true) &&
    (tipo ? pedido.estado === tipo : true)
  );


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
            <MenuItem value="PROCESSING">PROCESSING</MenuItem>
            <MenuItem value="PENDING">PENDING</MenuItem>
            <MenuItem value="DELIVERED">DELIVERED</MenuItem>
          </Select>
        </FormControl>
        {/* Botón Nuevo Pedido */}
        <Button
          className={styles.button}
          variant="contained"
          onClick={() => setCreateDialogOpen(true)}
          startIcon={<Add />}
        > Nuevo Pedido </Button>
        {/* Botón Subir Archivo */}
        <Button
          className={styles.button}
          variant="contained"
          onClick={handleOpenModal}
          startIcon={<UploadFile />}
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
            {pedidosFiltrados.map((pedido, i) => (
              <TableRow key={i}>
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

      {isModalOpen && <ModalCargaMasiva onClose={handleCloseModal} />}
      <CreatePedidoDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreateSuccess={fetchPedidos}
      />
    </div>
  );
};

export default Page;