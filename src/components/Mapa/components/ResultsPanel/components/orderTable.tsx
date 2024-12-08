/*orderTable.tsx*/

import React from 'react';
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams, 
  GridRowClassNameParams 
} from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { AddRoad } from '@mui/icons-material';
import { OrderRow } from '../../../../../context/Simulacion/simulationTypes';
import { esES } from '@mui/x-data-grid/locales'; 

interface OrderTableProps {
  data: OrderRow[];
  onShowTramos: (row: OrderRow) => void;
}

const PEDIDO_ESTADOS_CLASSES: Record<string, string> = {
  'Retrasado': 'row-retrasado',
  'Entregado': 'row-entregado',
  'En tránsito': 'row-transito'
};

const OrderTable: React.FC<OrderTableProps> = ({ data, onShowTramos }) => {
  const columns: GridColDef[] = [
    { field: 'ruta', headerName: 'Ruta', flex: 0.5, sortable: true },
    { field: 'pedido', headerName: 'Pedido', flex: 0.5, sortable: true },
    { field: 'inicio', headerName: 'Inicio', flex: 1, sortable: true },
    { field: 'fin', headerName: 'Fin', flex: 1, sortable: true },
    { field: 'origen', headerName: 'Origen', flex: 1, sortable: true },
    { field: 'destino', headerName: 'Destino', flex: 1, sortable: true },
    { field: 'paquetes', headerName: 'Paquetes', flex: 0.5, sortable: true },
    { field: 'estado', headerName: 'Estado', flex: 0.7, sortable: true },
    {
      field: 'tramos',
      headerName: 'Tramos',
      flex: 0.5,
      sortable:false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton onClick={() => onShowTramos(params.row as OrderRow)}>
          <AddRoad />
        </IconButton>
      )
    }
  ];

  const getRowClassName = (params: GridRowClassNameParams<OrderRow>) => {
    return PEDIDO_ESTADOS_CLASSES[params.row.estado] || '';
  };

  // Aseguramos que cada fila tenga su propio ID
  const rows = data.map((d,i)=>({...d, id:i}));

  return (
    <>
      <h3 style={{textAlign:'center'}}>Planes de transporte de pedidos</h3>
      <div style={{ height: 300, width:'100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          pageSizeOptions={[5,10]}
          disableRowSelectionOnClick
          getRowClassName={getRowClassName}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText} // Aplica la localización en español
          sx={{
            '& .row-retrasado': { backgroundColor: '#f8d7da' },
            '& .row-entregado': { backgroundColor: '#d4edda' },
            '& .row-transito': { backgroundColor: '#fff3cd' },
            '.MuiDataGrid-cell': {
              display:'flex',
              alignItems:'center'
            }
          }}
        />
      </div>
    </>
  );
};

export default OrderTable;
