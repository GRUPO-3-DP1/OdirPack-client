import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material';
import useCamiones from '../../../store/hooks/useCamiones';
import dayjs from 'dayjs';

interface CreateCamionDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateSuccess?: () => void;
}

const CreateCamionDialog: React.FC<CreateCamionDialogProps> = ({ open, onClose, onCreateSuccess }) => {
  const { createCamion } = useCamiones();

  const [formValues, setFormValues] = useState({
    placa: '',
    fechaLibre: '',
    almacenId: '',
    tipo: '',
    capacidad: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSubmit = async () => {
    const { placa, almacenId, tipo, capacidad } = formValues;

    // Validaciones básicas
    if (!placa || !tipo || !capacidad) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (isNaN(Number(capacidad))) {
      setError('La capacidad debe ser un número válido.');
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // Crear el camión
      await createCamion({
        placa,
        fechaLibre: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        almacenId: almacenId || null, // AlmacenId puede ser opcional
        tipo,
        capacidad: Number(capacidad),
      });

      onClose();
      onCreateSuccess?.();

      // Limpiar el formulario y cerrar el diálogo
      setFormValues({
        placa: '',
        fechaLibre: '',
        almacenId: '',
        tipo: '',
        capacidad: '',
      });
    } catch (err) {
      console.error('Error al crear el camión:', err);
      setError('Ocurrió un error al crear el camión.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormValues({
      placa: '',
      fechaLibre: '',
      almacenId: '',
      tipo: '',
      capacidad: '',
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear Camión</DialogTitle>
      <DialogContent>
        <TextField
          label="Placa"
          name="placa"
          value={formValues.placa}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Tipo de Camión"
          name="tipo"
          value={formValues.tipo}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Almacén"
          name="almacenId"
          value={formValues.almacenId}
          onChange={handleChange}
          fullWidth
          margin="normal"
          select
        >
          <MenuItem value="150101">LIMA</MenuItem>
          <MenuItem value="130101">TRUJILLO</MenuItem>
          <MenuItem value="040101">AREQUIPA</MenuItem>
        </TextField>
        <TextField
          label="Capacidad (en cantidad de paquetes)"
          name="capacidad"
          value={formValues.capacidad}
          onChange={handleChange}
          fullWidth
          margin="normal"
          type="number"
        />
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary" disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateCamionDialog;
