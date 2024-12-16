import React from 'react';
import Header from '../../components/Header/Header';
import { Button, Switch, FormControlLabel } from '@mui/material';
import { useOperacion } from '../../context/OperacionDia/useOperacion';

const CustomHeader: React.FC = () => {
  const { state, startOperacion, stopOperacion, toggleTestMode } = useOperacion();

  return (
    <Header>
      <Button
        variant="contained"
        onClick={state.isActive ? stopOperacion : startOperacion}
        color={state.isActive ? 'error' : 'primary'}
      >
        {state.isActive ? 'Detener Monitoreo' : 'Iniciar Monitoreo'}
      </Button>
      
      <FormControlLabel
        control={
          <Switch
            checked={state.isTestMode}
            onChange={toggleTestMode}
            disabled={state.isActive}
          />
        }
        label="Modo Prueba (1 min)"
      />

      {state.lastPlanificationTime && (
        <span>Última: {state.lastPlanificationTime.toLocaleTimeString()}</span>
      )}
      {state.nextPlanificationTime && (
        <span>Próxima: {state.nextPlanificationTime.toLocaleTimeString()}</span>
      )}
    </Header>
  );
};

export default CustomHeader;
