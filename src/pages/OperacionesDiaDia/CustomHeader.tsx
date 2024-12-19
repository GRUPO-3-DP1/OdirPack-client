import React from 'react';
import Header from '../../components/Header/Header';
import { Button, TextField, Box } from '@mui/material';
import { useOperacion } from '../../context/OperacionDia/useOperacion';
import { Stop, PlayArrow } from '@mui/icons-material';

const CustomHeader: React.FC = () => {
  const { state, startOperacion, stopOperacion } = useOperacion();

  //console.log('Tiempo simulado:', state.simulationTime);

  return (
    <Header>
      <Box display="flex" alignItems="center" gap={2}>
        <Button
          variant="contained"
          onClick={state.isPlaying ? stopOperacion : startOperacion}
          color={state.isPlaying ? 'error' : 'primary'}
          startIcon={state.isPlaying ? <Stop /> : <PlayArrow />}
        >
          {state.isPlaying ? 'Detener Monitoreo' : 'Iniciar Monitoreo'}
        </Button>

        <TextField
          size="small"
          label="Tiempo Simulado"
          value={state.currentTime.toLocaleString('es-ES', {
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit'
          })}
          disabled
          sx={{ width: '220px' }}
        />
      </Box>
    </Header>
  );
};

export default CustomHeader;
