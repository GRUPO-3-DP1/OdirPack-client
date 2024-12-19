import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import usePedidos from '../../../store/hooks/usePedidos';

interface CreatePedidoDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateSuccess?: () => void;
}

const CreatePedidoDialog: React.FC<CreatePedidoDialogProps> = ({
  open,
  onClose,
  onCreateSuccess
}) => {
  const { createPedido } = usePedidos();

  // Initial form values with clienteId removed
  const [formValues, setFormValues] = useState({
    destinoId: '',
    cantidadTotal: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle input changes
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  // Submit handler
  const handleSubmit = async () => {
    const { destinoId, cantidadTotal } = formValues;

    // Basic validations
    if (!destinoId || !cantidadTotal) {
      setError('Destino ID y Cantidad Total son obligatorios.');
      return;
    }

    // Validate cantidad total is a number
    const cantidadTotalNum = Number(cantidadTotal);
    if (isNaN(cantidadTotalNum) || cantidadTotalNum <= 0) {
      setError('La cantidad total debe ser un número válido mayor a cero.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare data matching the PedidoData type
      await createPedido({
        destinoId,
        cantidadTotal: cantidadTotalNum,
        clienteId: '' // Always send an empty string
      });

      // Reset and close
      resetForm();
      onClose();
      onCreateSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Ocurrió un error al crear el pedido.';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormValues({
      destinoId: '',
      cantidadTotal: '',
    });
    setError(null);
  };

  // Cancel handler
  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear Pedido</DialogTitle>
      <DialogContent>
        <TextField
          label="Destino ID"
          name="destinoId"
          value={formValues.destinoId}
          onChange={handleChange}
          fullWidth
          margin="normal"
          placeholder="Ej. 160101"
        />
        <TextField
          label="Cantidad Total"
          name="cantidadTotal"
          value={formValues.cantidadTotal}
          onChange={handleChange}
          fullWidth
          margin="normal"
          type="number"
          placeholder="Número de paquetes"
        />
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCancel}
          color="secondary"
          disabled={loading}
        >
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

export default CreatePedidoDialog;