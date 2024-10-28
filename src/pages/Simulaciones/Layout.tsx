import React, { useState } from 'react';
import styles from './layout.module.css';
import Header from '../../components/Header/Header';
import Page from './Page';
import { DateField, TimeField } from '@mui/x-date-pickers';
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { useSimulation } from '../../context/Simulacion/useSimulation';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';

const Layout: React.FC = () => {
  const [tipo, setTipo] = useState("");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs("2024-10-21T00:00:00"));
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs("2024-10-21T00:00:00"));


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
            idPedido: "PED-0007",
            fechaRegistro: "2024-10-22T03:30:00",
            ubigeoDestino: "150201",
            cantidad: "8",
            idCliente: "000624"
        },
        // Nuevos pedidos
        {
            idPedido: "PED-0008",
            fechaRegistro: "2024-10-21T02:00:00",
            ubigeoDestino: "150301",
            cantidad: "5",
            idCliente: "000707"
        },
        {
            idPedido: "PED-0009",
            fechaRegistro: "2024-10-21T02:15:00",
            ubigeoDestino: "150301",
            cantidad: "12",
            idCliente: "000624"
        },
        {
            idPedido: "PED-0010",
            fechaRegistro: "2024-10-21T02:45:00",
            ubigeoDestino: "150401",
            cantidad: "6",
            idCliente: "000707"
        },
        {
            idPedido: "PED-0011",
            fechaRegistro: "2024-10-21T03:10:00",
            ubigeoDestino: "150401",
            cantidad: "14",
            idCliente: "000707"
        },
        {
            idPedido: "PED-0012",
            fechaRegistro: "2024-10-21T03:50:00",
            ubigeoDestino: "150201",
            cantidad: "9",
            idCliente: "000707"
        },
        {
            idPedido: "PED-0013",
            fechaRegistro: "2024-10-21T04:20:00",
            ubigeoDestino: "150301",
            cantidad: "5",
            idCliente: "000624"
        },
        {
            idPedido: "PED-0014",
            fechaRegistro: "2024-10-21T04:55:00",
            ubigeoDestino: "150301",
            cantidad: "3",
            idCliente: "000707"
        },
        {
            idPedido: "PED-0015",
            fechaRegistro: "2024-10-21T05:30:00",
            ubigeoDestino: "150401",
            cantidad: "6",
            idCliente: "000624"
        },
        {
            idPedido: "PED-0016",
            fechaRegistro: "2024-10-21T05:50:00",
            ubigeoDestino: "150401",
            cantidad: "15",
            idCliente: "000707"
        },
        {
            idPedido: "PED-0017",
            fechaRegistro: "2024-10-21T06:15:00",
            ubigeoDestino: "150201",
            cantidad: "4",
            idCliente: "000624"
        },
        {
            idPedido: "PED-0018",
            fechaRegistro: "2024-10-21T06:30:00",
            ubigeoDestino: "150201",
            cantidad: "12",
            idCliente: "000624"
        },
        {
            idPedido: "PED-0019",
            fechaRegistro: "2024-10-21T07:00:00",
            ubigeoDestino: "150301",
            cantidad: "8",
            idCliente: "000707"
        },
        {
            idPedido: "PED-0020",
            fechaRegistro: "2024-10-21T07:15:00",
            ubigeoDestino: "150301",
            cantidad: "5",
            idCliente: "000624"
        },
        {
            idPedido: "PED-0021",
            fechaRegistro: "2024-10-21T07:40:00",
            ubigeoDestino: "150401",
            cantidad: "7",
            idCliente: "000707"
        },
        {
            idPedido: "PED-0022",
            fechaRegistro: "2024-10-21T08:05:00",
            ubigeoDestino: "150401",
            cantidad: "8",
            idCliente: "000624"
        },
        {
            idPedido: "PED-0023",
            fechaRegistro: "2024-10-22T08:25:00",
            ubigeoDestino: "150201",
            cantidad: "11",
            idCliente: "000707"
        },
        {
            idPedido: "PED-0024",
            fechaRegistro: "2024-10-22T08:45:00",
            ubigeoDestino: "150201",
            cantidad: "5",
            idCliente: "000624"
        },
        {
            idPedido: "PED-0025",
            fechaRegistro: "2024-10-22T09:05:00",
            ubigeoDestino: "150301",
            cantidad: "7",
            idCliente: "000707"
        },
        {
            idPedido: "PED-0026",
            fechaRegistro: "2024-10-22T09:25:00",
            ubigeoDestino: "150301",
            cantidad: "13",
            idCliente: "000624"
        },
        {
            idPedido: "PED-0027",
            fechaRegistro: "2024-10-23T09:55:00",
            ubigeoDestino: "150401",
            cantidad: "4",
            idCliente: "000707"
        },
        {
            idPedido: "PED-0028",
            fechaRegistro: "2024-10-23T10:10:00",
            ubigeoDestino: "150401",
            cantidad: "10",
            idCliente: "000624"
        },
        {
            idPedido: "PED-0029",
            fechaRegistro: "2024-10-23T10:35:00",
            ubigeoDestino: "150201",
            cantidad: "6",
            idCliente: "000707"
        },
        {
            idPedido: "PED-0030",
            fechaRegistro: "2024-10-23T10:50:00",
            ubigeoDestino: "150201",
            cantidad: "14",
            idCliente: "000624"
        },
        {
            idPedido: "PED-0031",
            fechaRegistro: "2024-10-23T11:10:00",
            ubigeoDestino: "150301",
            cantidad: "12",
            idCliente: "000707"
        },
        {
            idPedido: "PED-0032",
            fechaRegistro: "2024-10-23T11:30:00",
            ubigeoDestino: "150301",
            cantidad: "4",
            idCliente: "000624"
        },
        {
            idPedido: "PED-0033",
            fechaRegistro: "2024-10-23T11:55:00",
            ubigeoDestino: "150401",
            cantidad: "9",
            idCliente: "000707"
        },
        {
            idPedido: "PED-0034",
            fechaRegistro: "2024-10-24T12:15:00",
            ubigeoDestino: "150401",
            cantidad: "3",
            idCliente: "000624"
        },
        {
            idPedido: "PED-0035",
            fechaRegistro: "2024-10-24T12:40:00",
            ubigeoDestino: "150201",
            cantidad: "5",
            idCliente: "000707"
        }
      ],
      vehiculos: [
          {
              idVehiculo: "V001",
              capacidadCarga: 20,
              almacenOrigen: "150101",
              fechaLibre: null // Libre al inicio del plan
          },
          {
              idVehiculo: "V002",
              capacidadCarga: 25,
              almacenOrigen: "150101",
              fechaLibre: null
          },
          {
              idVehiculo: "V003",
              capacidadCarga: 10,
              almacenOrigen: "150101",
              fechaLibre: null
          },
          {
              idVehiculo: "V004",
              capacidadCarga: 25,
              almacenOrigen: "150101",
              fechaLibre: null
          },
          {
              idVehiculo: "V005",
              capacidadCarga: 40,
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