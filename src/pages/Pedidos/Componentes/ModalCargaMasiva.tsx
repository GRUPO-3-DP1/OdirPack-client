import React, { useState } from 'react';
import styles from './ModalCargaMasiva.module.css';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  Snackbar, Alert
} from '@mui/material';
import usePedidos from '../../../store/hooks/usePedidos';

interface ModalCargaMasivaProps {
  onClose: () => void;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const ModalCargaMasiva: React.FC<ModalCargaMasivaProps> = ({ onClose }) => {
  const [parsedData, setParsedData] = useState<{ destinoId: string, cantidadTotal: number, clienteId: string; }[]>([]);
  const [fileLoaded, setFileLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const { createPedido } = usePedidos();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        parseFileContent(lines);
        setFileLoaded(true);
      };
      reader.readAsText(file);
    }
  };

  const parseFileContent = (lines: string[]) => {
    const parsed = lines.map(line => {
      const lastPart = line.split('=>').pop()?.trim();

      if (!lastPart) {
        return null;
      }

      const [destinoId, cantidadTotal] = lastPart.split(',').map(item => item.trim());
      const cantidadTotalParsed = isNaN(Number(cantidadTotal)) ? 0 : Number(cantidadTotal);

      return {
        destinoId: destinoId,
        cantidadTotal: cantidadTotalParsed,
        clienteId: ''
      };
    }).filter(item => item !== null) as { destinoId: string, cantidadTotal: number, clienteId: string; }[];

    setParsedData(parsed);
  };

  const handleButtonClick = () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleUploadToDatabase = async () => {
    setIsLoading(true);
    try {
      for (const pedido of parsedData) {
        await createPedido(pedido);
      }
      showNotification('Todos los pedidos han sido subidos exitosamente', 'success');
      setFileLoaded(false);
      // Esperamos un momento antes de cerrar para que el usuario pueda ver la notificación
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error al subir los pedidos:', error);
      showNotification('Hubo un error al subir los pedidos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Carga Masiva de Archivos</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            disabled={isLoading}
          >
            &times;
          </button>
        </div>
        <div className={styles.modalSeparator}></div>

        {!fileLoaded && (
          <div className={styles.uploadSection}>
            <div className={styles.uploadTitle}>Sube un Archivo</div>
            <div className={styles.buttonContainer}>
              <Button
                className={styles.button}
                variant="outlined"
                onClick={handleButtonClick}
                disabled={isLoading}
              >
                Seleccionar Archivo
              </Button>
              <input
                id="fileInput"
                type="file"
                accept=".txt, .csv"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {fileLoaded && parsedData.length > 0 && (
          <div>
            <TableContainer component={Paper} className={styles.tableContainer}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Destino ID</TableCell>
                    <TableCell>Cantidad Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.destinoId}</TableCell>
                      <TableCell>{row.cantidadTotal}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <div className={styles.buttonContainer}>
              <Button
                className={styles.button}
                variant="outlined"
                onClick={() => setFileLoaded(false)}
                disabled={isLoading}
              >
                Subir Otro Archivo
              </Button>
              <Button
                className={styles.button}
                variant="contained"
                onClick={handleUploadToDatabase}
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar Pedidos'}
              </Button>
            </div>
          </div>
        )}

        <Snackbar
          open={notification.open}
          autoHideDuration={8000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default ModalCargaMasiva;