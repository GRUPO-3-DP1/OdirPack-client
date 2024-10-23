import React from 'react';
import styles from './layout.module.css';
import Header from '../../components/Header/Header';
import Page from './Page';
import { DateField, TimeField } from '@mui/x-date-pickers';
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { useSimulation } from '../../context/Simulacion/useSimulation';

const Layout: React.FC = () => {
  const [tipo, setTipo] = React.useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setTipo(event.target.value);
  };

  const { state, dispatch } = useSimulation();

  const startSimulation = () => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hora después
    dispatch({ type: 'START_SIMULATION', payload: { startTime, endTime } });
  };

  const stopSimulation = () => {
    dispatch({ type: 'STOP_SIMULATION' });
  };

  return (
    <div className={styles.container}>
      <Header isLoading={state.isPlaying}>
        <DateField
          size="small"
          label="Fecha"
          sx={{ width: '135px' }}
        />
        <TimeField
          size="small"
          label="Hora"
          sx={{ width: '100px' }}
        />
        <FormControl>
          <InputLabel id="tipo-label" size="small">Tipo</InputLabel>
          <Select
            labelId="tipo-label"
            id="tipo-select"
            value={tipo}
            label="Tipo"
            size="small"
            onChange={handleChange}
            sx={{ width: '170px' }}
          >
            <MenuItem value="semanal">Semanal</MenuItem>
            <MenuItem value="colapso">Hasta el colapso</MenuItem>
          </Select>
        </FormControl>
        {
          state.isPlaying ?
            <Button
              className={styles.button}
              variant='contained'
              color='error'
              startIcon={<Stop />}
              onClick={stopSimulation}
              disabled={!state.isPlaying}
            >
              Cancelar
            </Button>
            :
            <Button
              className={styles.button}
              variant='contained'
              startIcon={<PlayArrow />}
              onClick={startSimulation}
              disabled={state.isPlaying}
            >
              Iniciar
            </Button>
        }
      </Header>
      <main className={styles.main}>
        <Page />
      </main>
    </div>
  );
};

export default Layout;