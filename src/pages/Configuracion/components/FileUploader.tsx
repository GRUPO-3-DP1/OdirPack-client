import React from 'react';
import styles from './fileUploader.module.css'; // Crea un nuevo archivo CSS para este componente si es necesario
import { Button, Chip, styled } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useArchivos } from '../../../context/Archivos/useArchivos';

const FileUploader: React.FC = () => {
  const { archivos, subirArchivo, eliminarArchivo } = useArchivos();

  const validarNombreArchivo = (file: File): boolean => {
    const esCSV = file.name.endsWith('.txt');
    const contienePalabraClave = file.name.includes('c.1inf54.24-2.bloqueo.');
    return esCSV && contienePalabraClave;
  };

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      Array.from(event.target.files).forEach((file) => {
        if (validarNombreArchivo(file)) {
          subirArchivo(file);
        } else {
          alert(`El archivo "${file.name}" no cumple con el formato requerido.`);
        }
      });
    }
  };

  return (
    <div className={styles.container}>
      <h3>Datos de simulación</h3>
      <div className={styles.bloque}>
        <p>Bloqueos programados</p>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUpload />}
        >
          Seleccionar Archivo(s)
          <VisuallyHiddenInput
            type="file"
            onChange={handleFileChange}
            multiple
          />
        </Button>
      </div>
      <div className={styles.archivos}>
        {archivos.map((archivo) => (
          <Chip
            key={archivo.id}
            label={`${archivo.name}`}
            onDelete={() => eliminarArchivo(archivo.id)}
            className={styles.chip}
          />
        ))}
      </div>
    </div>
  );
};

export default FileUploader;
