import React from 'react';
import Header from '../../components/Header/Header';
import { Button, Switch, FormControlLabel, TextField, Box } from '@mui/material';
import { useOperacion } from '../../context/OperacionDia/useOperacion';
import dayjs from 'dayjs';

const CustomHeader: React.FC = () => {
  const { state, startOperacion, stopOperacion, toggleTestMode, setPlanificationInterval } = useOperacion();

  return (
    <Header>
      <Box display="flex" alignItems="center" gap={2}>
        <Button
          variant="contained"
          onClick={state.isActive ? stopOperacion : startOperacion}
          color={state.isActive ? 'error' : 'primary'}
        >
          {state.isActive ? 'Detener Monitoreo' : 'Iniciar Monitoreo'}
        </Button>

        <TextField
          size="small"
          label="Hora Simulada"
          value={state.isActive ? dayjs(state.simulationTime).format('DD/MM/YYYY HH:mm:ss') : ''}
          disabled
          sx={{ width: '220px' }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderLeft: '1px solid #ddd', pl: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={state.isTestMode}
                onChange={toggleTestMode}
                disabled={state.isActive}
              />
            }
            label="Modo Prueba"
          />
          
          <TextField
            type="number"
            size="small"
            label="Intervalo (min)"
            defaultValue={180}
            disabled={!state.isTestMode || state.isActive}
            onChange={(e) => setPlanificationInterval(Number(e.target.value))}
            sx={{ width: 120 }}
            InputProps={{
              inputProps: {
                min: 1,
                max: 180
              }
            }}
          />
        </Box>
      </Box>
    </Header>
  );
};

export default CustomHeader;
