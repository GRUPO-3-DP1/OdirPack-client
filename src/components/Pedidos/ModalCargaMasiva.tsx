import React, { useState } from 'react';
import styles from './modalCargaMasiva.module.css';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button
} from '@mui/material';
import usePedidos from '../../store/hooks/usePedidos';

interface ModalCargaMasivaProps {
  onClose: () => void;
}

const ModalCargaMasiva: React.FC<ModalCargaMasivaProps> = ({ onClose }) => {
  const [fileContent, setFileContent] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<{ destinoId: string, cantidadTotal: number, clienteId: string }[]>([]);
  const [fileLoaded, setFileLoaded] = useState<boolean>(false); // Estado para saber si el archivo fue cargado

  const {createPedido} = usePedidos();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        setFileContent(lines);
        parseFileContent(lines);
        setFileLoaded(true); // Marca que el archivo fue cargado
      };
      reader.readAsText(file);
    }
  };

  // Función para parsear el contenido del archivo y convertirlo en datos utilizables
  const parseFileContent = (lines: string[]) => {
    const parsed = lines.map(line => {
      const [destinoId, cantidadTotal, clienteId] = line.split(','); // Se asume que el archivo está en formato CSV
      const cantidadTotalParsed = isNaN(Number(cantidadTotal.trim())) ? 0 : Number(cantidadTotal.trim());
  
      return {
        destinoId: destinoId.trim(),
        cantidadTotal: cantidadTotalParsed, // Usar el valor convertido
        clienteId: clienteId.trim()
      };
    });
    setParsedData(parsed);
  };

  // Función para abrir el input de archivo al hacer clic en el botón
  const handleButtonClick = () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  };

  // Función para subir todos los pedidos a la base de datos
  const handleUploadToDatabase = async () => {
    try {
      for (const pedido of parsedData) {
        await createPedido(pedido);
      }
      alert('Todos los pedidos han sido subidos exitosamente');
      setFileLoaded(false); // Reiniciar estado
    } catch (error) {
      console.error('Error al subir los pedidos:', error);
      alert('Hubo un error al subir los pedidos');
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Carga Masiva de Archivos</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <div className={styles.modalSeparator}></div>

        {/* Sección para cargar el archivo */}
        {!fileLoaded && ( // Si el archivo no ha sido cargado, mostramos el botón
          <div className={styles.uploadSection}>
            <div className={styles.uploadTitle}>Sube un Archivo</div>
            <div className={styles.buttonContainer}>
              <Button
                className={styles.button}
                variant="outlined"
                onClick={handleButtonClick} // Al hacer clic en el botón, se abrirá el input de archivo
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

        {/* Si ya se han cargado datos, se muestra la tabla */}
        {fileLoaded && parsedData.length > 0 && ( // Si el archivo fue cargado, mostramos la tabla
          <div>
            <TableContainer component={Paper} className={styles.tableContainer}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Destino ID</TableCell>
                    <TableCell>Cantidad Total</TableCell>
                    <TableCell>Cliente ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.destinoId}</TableCell>
                      <TableCell>{row.cantidadTotal}</TableCell>
                      <TableCell>{row.clienteId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Botón para subir un nuevo archivo */}
            <div className={styles.buttonContainer}>
              <Button
                className={styles.button}
                variant="outlined"
                onClick={() => setFileLoaded(false)} // Reinicia el estado para cargar un nuevo archivo
              >
                Subir Otro Archivo
              </Button>
              <Button
                className={styles.button}
                variant="contained"
                onClick={handleUploadToDatabase} // Llamada a la función para subir los datos a la BD
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
