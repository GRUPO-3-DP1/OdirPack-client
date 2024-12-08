// orderSectionModal.tsx

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowClassNameParams,
} from '@mui/x-data-grid';
import { Close as CloseIcon } from '@mui/icons-material';

// Definimos la interfaz para cada tramo del pedido
interface PedidoSection {
  id: number;
  inicio: string;
  fin: string;
  origen: string;
  destino: string;
  estado: string; // "Entregado", "Retrasado", "En tránsito"
  camion: string;
}

interface OrderSectionModalProps {
  open: boolean;
  onClose: () => void;
  tramos: {
    inicio: string;
    fin: string;
    origen: string;
    destino: string;
    estado: string; // "Completado", "Retrasado", "En tránsito"
    camion: string;
  }[];
}

const OrderSectionModal: React.FC<OrderSectionModalProps> = ({ open, onClose, tramos }) => {
  const columns: GridColDef<PedidoSection>[] = [
    { field: 'inicio', headerName: 'Inicio', flex: 1, sortable: true },
    { field: 'fin', headerName: 'Fin', flex: 1, sortable: true },
    { field: 'origen', headerName: 'Origen', flex: 1, sortable: true },
    { field: 'destino', headerName: 'Destino', flex: 1, sortable: true },
    { field: 'estado', headerName: 'Estado', flex: 0.7, sortable: true },
    { field: 'camion', headerName: 'Camión', flex: 0.5, sortable: true },
  ];

  const getRowClassName = (params: GridRowClassNameParams<PedidoSection>) => {
    switch (params.row.estado) {
      case 'Entregado':
        return 'row-entregado';
      case 'Retrasado':
        return 'row-retrasado';
      case 'En tránsito':
        return 'row-transito';
      default:
        return '';
    }
  };

  const rows: PedidoSection[] = tramos.map((t, i) => ({ id: i, ...t }));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ position: 'relative' }}>
        Detalle de tramos
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ height: 400 }}>
        <div style={{ height: '100%', width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5, page: 0 },
              },
            }}
            pageSizeOptions={[5, 10]}
            disableRowSelectionOnClick
            getRowClassName={getRowClassName}
            sx={{
              '& .row-entregado': { backgroundColor: '#d4edda' },
              '& .row-retrasado': { backgroundColor: '#f8d7da' },
              '& .row-transito': { backgroundColor: '#fff3cd' }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSectionModal;
