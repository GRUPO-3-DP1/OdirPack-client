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
import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';

const Layout: React.FC = () => {
  const [tipo, setTipo] = useState("");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs());

  const handleChange = (event: SelectChangeEvent) => {
    setTipo(event.target.value);
  };

  const { state, dispatch , userId} = useSimulation();

  const startSimulation = async() => {
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
    const staticData = {
      pedidos: [
          {
              idPedido: "PED-0001",
              fechaRegistro: "2024-10-21T00:00:00",
              ubigeoDestino: "150301",
              cantidad: "10",
              idCliente: "000707"
          },
          {
              idPedido: "PED-0002",
              fechaRegistro: "2024-10-21T00:00:00",
              ubigeoDestino: "150301",
              cantidad: "3",
              idCliente: "000624"
          },
          {
              idPedido: "PED-0003",
              fechaRegistro: "2024-10-21T00:00:00",
              ubigeoDestino: "150401",
              cantidad: "2",
              idCliente: "000624"
          },
          {
              idPedido: "PED-0004",
              fechaRegistro: "2024-10-21T00:30:00",
              ubigeoDestino: "150401",
              cantidad: "7",
              idCliente: "000624"
          },
          {
              idPedido: "PED-0005",
              fechaRegistro: "2024-10-21T01:00:00",
              ubigeoDestino: "150401",
              cantidad: "10",
              idCliente: "000624"
          },
          {
              idPedido: "PED-0006",
              fechaRegistro: "2024-10-21T03:30:00",
              ubigeoDestino: "150201",
              cantidad: "8",
              idCliente: "000624"
          },
          {
              idPedido: "PED-0005",
              fechaRegistro: "2024-10-21T01:00:00",
              ubigeoDestino: "150401",
              cantidad: "10",
              idCliente: "000624"
          },
          {
              idPedido: "PED-0007",
              fechaRegistro: "2024-10-22T03:30:00",
              ubigeoDestino: "150201",
              cantidad: "8",
              idCliente: "000624"
          }
      ],
      vehiculos: [
          {
              idVehiculo: "V001",
              capacidadCarga: 10,
              almacenOrigen: "150101",
              fechaLibre: null // Libre al inicio del plan
          },
          {
              idVehiculo: "V002",
              capacidadCarga: 10,
              almacenOrigen: "150101",
              fechaLibre: null
          },
          {
              idVehiculo: "V003",
              capacidadCarga: 10,
              almacenOrigen: "150101",
              fechaLibre: null
          }
      ],
      bloqueos: [
          {
              fechaInicio: "2024-10-28T08:00:00",
              fechaFin: "2024-10-28T10:00:00",
              ubigeoOrigen: "001001",
              ubigeoDestino: "051001"
          }
      ],
      fechaInicio: "2024-10-21T00:00:00"
  };
  
    try {
        const response = await axios.post(
            `${ServicesProperties.BaseUrl}/simulacion/iniciar?userId=${userId}`, staticData,
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
        </LocalizationProvider>
      </Header>
      <main className={styles.main}>
        <Page />
      </main>
    </div>
  );
};

export default Layout;