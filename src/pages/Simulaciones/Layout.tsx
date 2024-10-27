import React, { useState } from 'react';
import styles from './layout.module.css';
import Header from '../../components/Header/Header';
import Page from './Page';
import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Box,
} from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { useSimulation } from '../../context/Simulacion/useSimulation';
import dayjs, { Dayjs } from 'dayjs';

const Layout: React.FC = () => {
  const [tipo, setTipo] = useState("");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs());

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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box display="flex" alignItems="center" gap={2}>
            <DatePicker
              label="Fecha"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              disabled={state.isPlaying}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { width: '165px' },
                  disabled: state.isPlaying,
                },
              }}
            />
            <TimePicker
              label="Hora"
              value={selectedTime}
              onChange={(newValue) => setSelectedTime(newValue)}
              disabled={state.isPlaying}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { width: '145px' },
                  disabled: state.isPlaying,
                },
              }}
            />
            <FormControl
              size="small"
              sx={{ width: '170px' }}
              disabled={state.isPlaying}
            >
              <InputLabel id="tipo-label">Tipo</InputLabel>
              <Select
                labelId="tipo-label"
                id="tipo-select"
                value={tipo}
                label="Tipo"
                onChange={handleChange}
                disabled={state.isPlaying}
              >
                <MenuItem value="semanal">Semanal</MenuItem>
                <MenuItem value="colapso">Hasta el colapso</MenuItem>
              </Select>
            </FormControl>
            <Button
              className={styles.button}
              variant="contained"
              startIcon={state.isPlaying ? <Stop /> : <PlayArrow />}
              onClick={state.isPlaying ? stopSimulation : startSimulation}
              disabled={!state.isPlaying && tipo !== 'semanal'}
              color={state.isPlaying ? 'error' : 'primary'}
            >
              {state.isPlaying ? 'Cancelar' : 'Iniciar'}
            </Button>
          </Box>
        </LocalizationProvider>
      </Header>
      <main className={styles.main}>
        <Page />
      </main>
    </div>
  );
};

export default Layout;