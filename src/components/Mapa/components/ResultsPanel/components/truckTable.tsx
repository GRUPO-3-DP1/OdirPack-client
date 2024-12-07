/*truckTable.tsx*/

import React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowClassNameParams } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { AddRoad, WarningAmber, CheckCircle } from '@mui/icons-material';
import { TruckRow } from '../../../../../context/Simulacion/simulationTypes'; 

interface TruckTableProps {
  data: TruckRow[];
  onShowTramos: (row: TruckRow) => void;
}

const CAMION_ESTADOS_CLASSES: Record<string, string> = {
  'Completado': 'row-completado',
  'Averiado': 'row-averiado',
  'En tránsito': 'row-transito'
};

const TruckTable: React.FC<TruckTableProps> = ({ data, onShowTramos }) => {
  const columns: GridColDef[] = [
    { field: 'ruta', headerName: 'Ruta', flex:1, sortable:true },
    { field: 'camion', headerName: 'Camión', flex:1, sortable:true },
    { field: 'inicio', headerName: 'Inicio', flex:1, sortable:true },
    { field: 'fin', headerName: 'Fin', flex:1, sortable:true },
    { field: 'origen', headerName: 'Origen', flex:1, sortable:true },
    { field: 'destino', headerName: 'Destino', flex:1, sortable:true },
    {
      field: 'averia',
      headerName: '¿Avería?',
      flex:1,
      sortable:true,
      renderCell: (params:GridRenderCellParams) => (
        params.value ? <WarningAmber sx={{color:'red'}} titleAccess="Sí"/> : <CheckCircle sx={{color:'green'}} titleAccess="No"/>
      )
    },
    { field: 'estado', headerName: 'Estado', flex:1, sortable:true },
    {
      field: 'tramos',
      headerName: 'Tramos',
      flex:0.7,
      sortable:false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton onClick={() => onShowTramos(params.row as TruckRow)}>
          <AddRoad />
        </IconButton>
      )
    }
  ];

  const getRowClassName = (params: GridRowClassNameParams<TruckRow>) => {
    return CAMION_ESTADOS_CLASSES[params.row.estado] || '';
  };

  const rows = data.map((d,i)=>({...d, id:i}));

  return (
    <>
      <h3 style={{textAlign:'center'}}>Planes de transporte de camiones</h3>
      <div style={{ height: 300, width:'100%' }}>
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
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#000',
              color: '#fff'
            },
            '& .row-completado': { backgroundColor: '#d4edda' },
            '& .row-averiado': { backgroundColor: '#f8d7da' },
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

export default TruckTable;
