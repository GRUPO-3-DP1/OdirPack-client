import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import { Chip, styled, Box, Typography, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { Mes, MesReal } from '../../store/types/Mes';
import usePedidosSimulacion from '../../store/hooks/usePedidosSimulacion';
import useBloqueosSimulacion from '../../store/hooks/useBloqueosSimulacion';

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
  const {
    pedidosSimulacion,
    error: pedidosError,
    fetchPedidosSimulacion,
    uploadFile: uploadPedidosFile,
    deleteFile: deletePedidosFile,
    loading: loadingPedidos
  } = usePedidosSimulacion();
  const {
    bloqueosSimulacion,
    error: bloqueosError,
    fetchBloqueosSimulacion,
    uploadFile: uploadBloqueosFile,
    deleteFile: deleteBloqueosFile,
    loading: loadingBloqueos
  } = useBloqueosSimulacion();
  const [loadingMes, setLoadingMes] = useState<Record<string, boolean>>({});
  const [snackbar, setSnackbar] = useState<string | null>(null); // Para mostrar errores de validación

  useEffect(() => {
    fetchPedidosSimulacion();
  }, [fetchPedidosSimulacion]);

  useEffect(() => {
    fetchBloqueosSimulacion();
  }, [fetchBloqueosSimulacion]);

  // Cerrar Snackbar
  const handleCloseSnackbar = () => setSnackbar(null);

  // Validar nombre del archivo
  const isValidPedidosFileName = (fileName: string, mes: Mes): boolean => {
    const expectedSuffix = mes;
    const regex = new RegExp(`^c\\.1inf54\\.ventas${expectedSuffix}\\.txt$`);
    return regex.test(fileName);
  };

  // Manejar subida de archivo
  const handlePedidosFileChange = async (event: React.ChangeEvent<HTMLInputElement>, mes: Mes) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const fileName = file.name;

      // Validar el nombre del archivo
      if (!isValidPedidosFileName(fileName, mes)) {
        setSnackbar(`El archivo "${fileName}" no es válido para el mes ${mes}.`);
        return;
      }

      setLoadingMes((prev) => ({ ...prev, [mes]: true }));
      try {
        await uploadPedidosFile(mes, file); // Subir archivo
        await fetchPedidosSimulacion(); // Actualizar simulación
      } catch (err) {
        setSnackbar(`Error al subir el archivo: ${(err as Error).message}`);
      } finally {
        setLoadingMes((prev) => ({ ...prev, [mes]: false }));
      }
    }
  };

  // Manejar eliminación de archivo
  const handlePedidosDelete = async (mes: Mes) => {
    setLoadingMes((prev) => ({ ...prev, [mes]: true }));
    try {
      await deletePedidosFile(mes);
      await fetchPedidosSimulacion();
    } catch (err) {
      setSnackbar(`Error al eliminar el archivo: ${(err as Error).message}`);
    } finally {
      setLoadingMes((prev) => ({ ...prev, [mes]: false }));
    }
  };

  // Renderizar chip dinámicamente
  const renderPedidosChip = (mes: Mes) => {
    const archivo = pedidosSimulacion["archivo" + mes];
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
          {isLoading || loadingPedidos ? (
            <CircularProgress size={20} />
          ) : archivo ? (
            <Chip
              variant="outlined"
              label={archivo.nombre}
              onDelete={() => handlePedidosDelete(mes)}
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
                onChange={(e) => handlePedidosFileChange(e, mes)}
              />
            </Button>
          )}
        </div>
      </Box>
    );
  };

  // Manejar subida de archivo
  const handleBloqueosFileChange = async (event: React.ChangeEvent<HTMLInputElement>, mes: MesReal) => {
    if (event.target.files) {
      const file = event.target.files[0];
      // const fileName = file.name;

      // Validar el nombre del archivo
      // if (!isValidPedidosFileName(fileName, mes)) {
      //   setSnackbar(`El archivo "${fileName}" no es válido para el mes ${mes}.`);
      //   return;
      // }

      setLoadingMes((prev) => ({ ...prev, [mes]: true }));
      try {
        await uploadBloqueosFile(mes, file); // Subir archivo
        await fetchBloqueosSimulacion(); // Actualizar simulación
      } catch (err) {
        setSnackbar(`Error al subir el archivo: ${(err as Error).message}`);
      } finally {
        setLoadingMes((prev) => ({ ...prev, [mes]: false }));
      }
    }
  };

  // Manejar eliminación de archivo
  const handleBloqueosDelete = async (mes: MesReal) => {
    setLoadingMes((prev) => ({ ...prev, [mes]: true }));
    try {
      await deleteBloqueosFile(mes);
      await fetchBloqueosSimulacion();
    } catch (err) {
      setSnackbar(`Error al eliminar el archivo: ${(err as Error).message}`);
    } finally {
      setLoadingMes((prev) => ({ ...prev, [mes]: false }));
    }
  };

  // Renderizar chip dinámicamente
  const renderBloqueosChip = (mes: MesReal) => {
    const archivo = bloqueosSimulacion[mes.toLocaleLowerCase() as keyof typeof bloqueosSimulacion];
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
          {isLoading || loadingBloqueos ? (
            <CircularProgress size={20} />
          ) : archivo ? (
            <Chip
              variant="outlined"
              label={archivo.nombre}
              onDelete={() => handleBloqueosDelete(mes)}
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
                onChange={(e) => handleBloqueosFileChange(e, mes)}
              />
            </Button>
          )}
        </div>
      </Box>
    );
  };

  if (pedidosError || bloqueosError) {
    return (
      <div className={styles.container}>
        <Typography color="error">ERROR</Typography>
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
            {renderPedidosChip(mes)}
          </Box>
        ))}
      </Box>

      <h3>Simulacion - Bloqueos</h3>
      <Box
        display="flex"
        flexDirection="column"
        gap={3}
      >
        {Object.values(MesReal).map((mes) => (
          <Box key={mes} display="flex" flexDirection="row" gap={3} width="100%">
            {renderBloqueosChip(mes)}
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
    </div>
  );
};

export default Page;
