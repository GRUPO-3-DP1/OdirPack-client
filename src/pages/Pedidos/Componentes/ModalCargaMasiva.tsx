import React, { useState } from 'react';
import styles from './ModalCargaMasiva.module.css';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button
} from '@mui/material';
import usePedidos from '../../../store/hooks/usePedidos';

interface ModalCargaMasivaProps {
  onClose: () => void;
}

const ModalCargaMasiva: React.FC<ModalCargaMasivaProps> = ({ onClose }) => {
  // @ts-ignore
  const [fileContent, setFileContent] = useState<string[]>([]);

  const [parsedData, setParsedData] = useState<{ destinoId: string, cantidadTotal: number, clienteId: string; }[]>([]);
  const [fileLoaded, setFileLoaded] = useState<boolean>(false);

  const { createPedido } = usePedidos();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        setFileContent(lines);
        parseFileContent(lines);
        setFileLoaded(true);
      };
      reader.readAsText(file);
    }
  };

  // Updated parsing function for the new file format
  const parseFileContent = (lines: string[]) => {
    const parsed = lines.map(line => {
      // Extract the last part of the line (ubigeo and quantity)
      const lastPart = line.split('=>').pop()?.trim();

      if (!lastPart) {
        return null;
      }

      // Split the last part by comma
      const [destinoId, cantidadTotal] = lastPart.split(',').map(item => item.trim());

      // Convert quantity to a number, defaulting to 0 if invalid
      const cantidadTotalParsed = isNaN(Number(cantidadTotal)) ? 0 : Number(cantidadTotal);

      return {
        destinoId: destinoId,
        cantidadTotal: cantidadTotalParsed,
        clienteId: '' // Left empty as not present in new format
      };
    }).filter(item => item !== null) as { destinoId: string, cantidadTotal: number, clienteId: string; }[];

    setParsedData(parsed);
  };

  // Rest of the component remains the same as in the original code...
  const handleButtonClick = () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  };

  const handleUploadToDatabase = async () => {
    try {
      for (const pedido of parsedData) {
        await createPedido(pedido);
      }
      alert('Todos los pedidos han sido subidos exitosamente');
      setFileLoaded(false);
      onClose();
    } catch (error) {
      console.error('Error al subir los pedidos:', error);
      alert('Hubo un error al subir los pedidos');
    }
  };

  return (
    <div className={styles.modalOverlay}>
      {/* Rest of the render method remains the same */}
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Carga Masiva de Archivos</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
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
              >Seleccionar Archivo</Button>
              <input
                id="fileInput"
                type="file"
                accept=".txt, .csv"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
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
              >
                Subir Otro Archivo
              </Button>
              <Button
                className={styles.button}
                variant="contained"
                onClick={handleUploadToDatabase}
              >
                Guardar Pedidos
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalCargaMasiva;