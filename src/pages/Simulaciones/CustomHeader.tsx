import React, { useState } from 'react';
import styles from './layout.module.css';
import Header from '../../components/Header/Header';
import {
  DatePicker,
  TimePicker,
} from '@mui/x-date-pickers';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { useSimulation } from '../../context/Simulacion/useSimulation';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { dataPrueba } from '../../data/dataPrueba';

const CustomHeader: React.FC = () => {
  const [tipo, setTipo] = useState("");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs('2024-10-21'));
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs('2023-10-21T00:00'));

  const handleChange = (event: SelectChangeEvent) => {
    setTipo(event.target.value);
  };

  const { state, dispatch, userId } = useSimulation();

  const startSimulation = async () => {
    console.log("startSimulation");
    if (selectedDate && selectedTime) {
      console.log("entra a startSimulation");
      const startTime = new Date(selectedDate.year(), selectedDate.month(), selectedDate.date(), selectedTime.hour(), selectedTime.minute());
      const endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días después
      dispatch({ type: 'START_SIMULATION', payload: { startTime, endTime } });
      // Llama a handleIniciarSimulacion después de iniciar la simulación
      await handleIniciarSimulacion();
    }
  };

  const handleIniciarSimulacion = async () => {
    try {
      const response = await axios.post(
        `${ServicesProperties.BaseUrl}/simulacion/iniciar?userId=${userId}`, dataPrueba,
        { headers: ServicesProperties.Headers }
      );
      console.log('Simulación iniciada, respuesta del servidor:', response.data);
    } catch (error) {
      console.error('Error al iniciar la simulación:', error);
    }
  };

  const stopSimulation = () => {
    dispatch({ type: 'STOP_SIMULATION' });
  };
  return (
    <Header isLoading={state.isPlaying}>
      <Box display="flex" alignItems="center" gap={2}>
        <DatePicker
          label="Fecha"
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          disabled={state.isPlaying}
          slotProps={{
            textField: {
              size: 'small',
              sx: { width: '149px' },
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
              sx: { width: '135px' },
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
    </Header>
  );
};

export default CustomHeader;