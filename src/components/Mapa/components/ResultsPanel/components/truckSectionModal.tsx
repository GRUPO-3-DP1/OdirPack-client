/*truckSectionModal.tsx*/

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
import { esES } from '@mui/x-data-grid/locales';

// Definimos la interfaz para cada tramo
interface TruckSection {
  id: number;
  horaAveria?: string;
  inicio: string;
  fin: string;
  origen: string;
  destino: string;
  estado: string;
}

interface TruckSectionModalProps {
  open: boolean;
  onClose: () => void;
  tramos: {
    inicio: string;
    fin: string;
    origen: string;
    destino: string;
    estado: string; // "Completado", "Averiado", "En tránsito"
    horaAveria?: string;
  }[];
}

const TruckSectionModal: React.FC<TruckSectionModalProps> = ({ open, onClose, tramos }) => {
  const columns: GridColDef<TruckSection>[] = [
    { field: 'inicio', headerName: 'Inicio', flex: 1, sortable: true },
    { field: 'fin', headerName: 'Fin', flex: 1, sortable: true },
    { field: 'origen', headerName: 'Origen', flex: 1, sortable: true },
    { field: 'destino', headerName: 'Destino', flex: 1, sortable: true },
    { field: 'estado', headerName: 'Estado', flex: 0.7, sortable: true },
    {
      field: 'horaAveria',
      headerName: 'Hora de avería',
      flex: 1,
      sortable: true,
      valueGetter: (params: GridRowClassNameParams<TruckSection>) => {
        return params.row.horaAveria || 'Sin avería';
      },
    },
  ];

  const getRowClassName = (params: GridRowClassNameParams<TruckSection>) => {
    switch (params.row.estado) {
      case 'Completado': return 'row-completado';
      case 'Averiado': return 'row-averiado';
      case 'En tránsito': return 'row-transito';
      default: return '';
    }
  };

  const rows: TruckSection[] = tramos.map((t, i) => ({ id: i, ...t }));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ position:'relative' }}>
        Detalle de tramos
        <IconButton 
          onClick={onClose}
          sx={{ position:'absolute', right:8, top:8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ height:400 }}>
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
            localeText={esES.components.MuiDataGrid.defaultProps.localeText} // Aplica la localización en español
            sx={{
              '& .row-completado': { backgroundColor: '#d4edda' },
              '& .row-averiado': { backgroundColor: '#f8d7da' },
              '& .row-transito': { backgroundColor: '#fff3cd' }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TruckSectionModal;
