import React, { useEffect } from 'react';
import styles from './page.module.css';
import { Chip, styled, Box, Typography, Button, CircularProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { Mes } from '../../store/types/Mes';
import useArchivos from '../../store/hooks/useArchivos';
import { PedidosSimulacion } from '../../store/types/PedidosSimulacion';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const Page: React.FC = () => {
  const { simulacion, loading, error, fetchSimulacion, uploadFile, deleteFile } = useArchivos();

  useEffect(() => {
    fetchSimulacion();
  }, [fetchSimulacion]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, mes: Mes) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      for (const file of files) {
        await uploadFile(mes, file); // Esperar a que se complete la subida
      }
      await fetchSimulacion(); // Refrescar la información después de subir archivos
    }
  };

  const handleDelete = async (mes: Mes) => {
    await deleteFile(mes); // Esperar a que se complete la eliminación
    await fetchSimulacion(); // Refrescar la información después de eliminar un archivo
  };

  const renderChip = (mes: Mes) => {
    const mesKey = mes.toLowerCase() as keyof PedidosSimulacion;

    const archivo = simulacion[mesKey];

    return (
      <Box key={mes}>
        <Typography variant="h6">{mes}</Typography>

        <div className={styles.monthContainer}>
          {archivo ? (
            <Chip
              variant="outlined"
              label={archivo.nombre}
              onDelete={() => handleDelete(mes)}
              color="primary"
              className={styles.button}
            />
          ) : (
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUpload />}
              className={styles.button}
            >
              Subir Archivo
              <VisuallyHiddenInput
                type="file"
                onChange={(e) => handleFileChange(e, mes)}
                multiple
              />
            </Button>
          )}
        </div>
      </Box>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <CircularProgress />
        <Typography variant="h6" sx={{ marginTop: '10px' }}>Cargando simulación...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3>Simulacion - Pedidos</h3>
      <Box
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        gap={3}
        sx={{ marginTop: '20px' }}
      >
        {Object.values(Mes).map((mes) => renderChip(mes))}
      </Box>
    </div>
  );
};

export default Page;
