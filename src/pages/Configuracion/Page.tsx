import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import { Chip, styled, Box, Typography, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { Mes } from '../../store/types/Mes';
import useArchivos from '../../store/hooks/useArchivos';
import FileUploader from './components/FileUploader';

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
  const { simulacion, error, fetchSimulacion, uploadFile, deleteFile, loading } = useArchivos();
  const [loadingMes, setLoadingMes] = useState<Record<string, boolean>>({});
  const [snackbar, setSnackbar] = useState<string | null>(null); // Para mostrar errores de validación

  useEffect(() => {
    fetchSimulacion();
  }, [fetchSimulacion]);

  // Cerrar Snackbar
  const handleCloseSnackbar = () => setSnackbar(null);

  // Validar nombre del archivo
  const isValidFileName = (fileName: string, mes: Mes): boolean => {
    // Asegúrate de que 'mes' sea una cadena que contiene solo los números del mes (por ejemplo, '202407')
    const expectedSuffix = mes; // mes será algo como '202407'

    // Modificar la expresión regular para aceptar solo archivos con extensión .txt
    const regex = new RegExp(`^c\\.1inf54\\.ventas${expectedSuffix}\\.txt$`);

    return regex.test(fileName);
  };

  // Manejar subida de archivo
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, mes: Mes) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const fileName = file.name;

      // Validar el nombre del archivo
      if (!isValidFileName(fileName, mes)) {
        setSnackbar(`El archivo "${fileName}" no es válido para el mes ${mes}.`);
        return;
      }

      setLoadingMes((prev) => ({ ...prev, [mes]: true }));
      try {
        await uploadFile(mes, file); // Subir archivo
        await fetchSimulacion(); // Actualizar simulación
      } catch (err) {
        setSnackbar(`Error al subir el archivo: ${(err as Error).message}`);
      } finally {
        setLoadingMes((prev) => ({ ...prev, [mes]: false }));
      }
    }
  };

  // Manejar eliminación de archivo
  const handleDelete = async (mes: Mes) => {
    setLoadingMes((prev) => ({ ...prev, [mes]: true }));
    try {
      await deleteFile(mes);
      await fetchSimulacion();
    } catch (err) {
      setSnackbar(`Error al eliminar el archivo: ${(err as Error).message}`);
    } finally {
      setLoadingMes((prev) => ({ ...prev, [mes]: false }));
    }
  };

  // Renderizar chip dinámicamente
  const renderChip = (mes: Mes) => {
    const archivo = simulacion["archivo" + mes];
    const isLoading = loadingMes[mes] ?? false;

    return (
      <Box
        display="flex"
        justifyContent={'space-between'}
        gap={5}
        key={mes}
      >
        <Typography variant="subtitle1">{mes}</Typography>

        <div className={styles.monthContainer}>
          {isLoading || loading ? (
            <CircularProgress size={20} />
          ) : archivo ? (
            <Chip
              variant="outlined"
              label={archivo.nombre}
              onDelete={() => handleDelete(mes)}
              color="primary"
              className={styles.button}
              size="small"
            />
          ) : (
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUpload />}
              className={styles.button}
              size="small"
            >
              Subir Archivo
              <VisuallyHiddenInput
                type="file"
                onChange={(e) => handleFileChange(e, mes)}
              />
            </Button>
          )}
        </div>
      </Box>
    );
  };

  if (error) {
    return (
      <div className={styles.container}>
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ height: '100%', overflow: 'auto' }}>
      <h3>Simulacion - Pedidos</h3>
      <Box
        display="flex"
        flexDirection="column"
        gap={3}
      >
        {Object.values(Mes).map((mes) => (
          <Box key={mes} display="flex" flexDirection="row" gap={3} width="100%">
            {renderChip(mes)}
          </Box>
        ))}
      </Box>

      {/* Snackbar para errores de validación */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Posicionar en la parte inferior derecha
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {snackbar}
        </Alert>
      </Snackbar>
      <FileUploader />
    </div>
  );
};

export default Page;
