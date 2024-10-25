import React, { useState } from 'react';
import styles from './layout.module.css';
import Header from '../../components/Header/Header';
import Page from './Page';
import { DateField, TimeField } from '@mui/x-date-pickers';
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { useSimulation } from '../../context/Simulacion/useSimulation';
import dayjs, { Dayjs } from 'dayjs';

const Layout: React.FC = () => {
  const [tipo, setTipo] = useState("");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs("2024-10-21T00:00:00"));
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs("2024-10-21T00:00:00"));


  const handleChange = (event: SelectChangeEvent) => {
    setTipo(event.target.value);
  };

  const { state, dispatch } = useSimulation();

  const startSimulation = () => {
    console.log("startSimulation");
    if (selectedDate && selectedTime) {
      console.log("entra a startSimulation");
      const startTime = new Date(selectedDate.year(), selectedDate.month(), selectedDate.date(), selectedTime.hour(), selectedTime.minute());
      const endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días después

      dispatch({ type: 'START_SIMULATION', payload: { startTime, endTime } });
    }
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
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          sx={{ width: '135px' }}
          disabled={state.isPlaying}
        />
        <TimeField
          size="small"
          label="Hora"
          value={selectedTime}
          onChange={(newValue) => setSelectedTime(newValue)}
          sx={{ width: '100px' }}
          disabled={state.isPlaying}
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
            disabled={state.isPlaying}
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
              disabled={state.isPlaying || tipo !== "semanal"}
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