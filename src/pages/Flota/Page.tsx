import React, { useEffect, useState } from 'react';
import useCamiones from '../../store/hooks/useCamiones';
import styles from './page.module.css';
import { Box, Button, FormControl, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { Add, UploadFile } from '@mui/icons-material';
import { formatDate } from '../../utils/formatDate';
import CreateCamionDialog from './components/CreateCamionDialog';

const Page: React.FC = () => {
  const { camiones, fetchCamiones } = useCamiones();
  const [placa, setPlaca] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchCamiones();
  }, [fetchCamiones]);

  const handlePlacaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlaca(event.target.value);
  };

  // Filtrar camiones según la placa
  const camionesFiltrados = camiones.filter((camion) =>
    camion.placa.toLowerCase().includes(placa.toLowerCase())
  );

  return (
    <div className={styles.contenedor}>
      <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={2}>
        {/* Input Placa del Camión */}
        <FormControl size="small" sx={{ flex: 1, minWidth: '170px' }}>
          <TextField
            id="placa-camion-input"
            label="Placa del Camión"
            variant="outlined"
            size="small"
            value={placa}
            onChange={handlePlacaChange}
          />
        </FormControl>

        {/* Botón Crear Camión */}
        <Button
          className={styles.button}
          variant="contained"
          onClick={() => setCreateDialogOpen(true)} // Abre el diálogo
          startIcon={<Add />}
        >
          Crear Camión
        </Button>

        {/* Botón Subir Archivo */}
        <Button
          className={styles.button}
          variant="contained"
          onClick={() => { }}
          startIcon={<UploadFile />}
        >
          Subir Archivo
        </Button>
      </Box>

      {/* Tabla de Camiones */}
      <TableContainer component={Paper} className={styles.tableContainer}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Placa</TableCell>
              <TableCell>Almacén</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Capacidad</TableCell>
              <TableCell>Fecha Libre</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {camionesFiltrados.map((camion) => (
              <TableRow key={camion.camionId}>
                <TableCell>{camion.camionId}</TableCell>
                <TableCell>{camion.placa}</TableCell>
                <TableCell>{camion.almacenId || 'N/A'}</TableCell>
                <TableCell>{camion.tipo}</TableCell>
                <TableCell>{camion.capacidad}</TableCell>
                <TableCell>{formatDate(camion.fechaLibre || '')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <CreateCamionDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreateSuccess={fetchCamiones}
      />
    </div>
  );
};

export default Page;
