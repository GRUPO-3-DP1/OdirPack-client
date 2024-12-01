import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import {
  DatePicker,
  TimePicker,
} from '@mui/x-date-pickers';
import {
  Button,
  FormControl,
  MenuItem,
  Select,
  Box,
  SelectChangeEvent,
  TextField, 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { PlayArrow, Stop } from '@mui/icons-material';
import { useData } from '../../context/useData';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { dataPrueba } from '../../data/nuevaDataPrueba';

const CustomHeader: React.FC = () => {

  // Estados existentes...
  const [searchCode, setSearchCode] = useState<string>('');
  const [tipo, setTipo] = useState("");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs('2024-10-01'));
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs('2024-10-01T00:00'));

  const handleChange = (event: SelectChangeEvent) => {
    setTipo(event.target.value);
  };

  const { state, dispatch, userId, stopSimulation } = useData();

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

  const getDynamicBackground = (value: any) => (value ? '#E6F0FB' : '#FAFAFA'); 

  return (
    <Header isLoading={state.isPlaying}>
      <Box
        display="flex"
        flexDirection="column"
        gap={1} // Incrementa el espacio entre las filas
        sx={{ paddingTop: '10px' }} // Agrega espacio superior
      >
        <Box display="flex" alignItems="center" gap={2}>
          <DatePicker
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            disabled={state.isPlaying}
            format="DD/MM/YYYY" 
            slotProps={{
              textField: {
                size: 'small',
                placeholder: 'Fecha',
                sx: { 
                  width: '149px',
                  backgroundColor: getDynamicBackground(selectedDate),  
                },
                disabled: state.isPlaying,
              },
            }}
          />
          <TimePicker
            value={selectedTime}
            onChange={(newValue) => setSelectedTime(newValue)}
            disabled={state.isPlaying}
            views={['hours', 'minutes']}
            ampm 
            slotProps={{
              textField: {
                size: 'small',
                placeholder: 'Hora',
                sx: { 
                  width: '135px',
                  backgroundColor: getDynamicBackground(selectedTime),
                },
                disabled: state.isPlaying,
              },
            }}
          />
          <FormControl
            size="small"
            sx={{
              width: '170px',
              backgroundColor: getDynamicBackground(tipo),
              '.MuiOutlinedInput-root': {
                padding: 0, // Elimina padding interno no deseado
              },
              '.MuiOutlinedInput-notchedOutline': {
                borderWidth: '1px', // Mantiene el borde visible
              },
            }}
            disabled={state.isPlaying}
          >
            <Select
              displayEmpty
              value={tipo}
              onChange={handleChange}
              disabled={state.isPlaying}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#999' }}>Tipo</span>; // Placeholder estilizado
                }
                return selected;
              }}
              sx={{
                padding: '8px 12px', // Centra el texto dentro del cuadro
                height: '40px', // Asegura un tamaño uniforme con otros inputs
                lineHeight: 'normal', // Centra visualmente el texto
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    marginTop: '5px', // Ajusta el espacio entre el cuadro y el menú desplegable
                  },
                },
              }}
            >
              <MenuItem value="" disabled>
                Tipo
              </MenuItem>
              <MenuItem value="Semanal">Semanal</MenuItem>
              <MenuItem value="Hasta el colapso">Hasta el colapso</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={state.isPlaying ? stopSimulation : startSimulation}
            color={state.isPlaying ? 'error' : 'primary'}
            sx={{
              minWidth: '40px', // Tamaño mínimo para igualarlo al botón de búsqueda
              height: '40px', // Igual altura que el botón de búsqueda
              padding: 0, // Sin padding adicional
              display: 'flex', // Para centrar el ícono
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {state.isPlaying ? <Stop /> : <PlayArrow />}
          </Button>        
        </Box>
        {/* Contenedor para el buscador */}
        <Box display="flex" alignItems="center" justifyContent="flex-start" gap={2}>
          <TextField
            size="small"
            placeholder="Ingrese el código del Pedido, Camión u Oficina"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            sx={{ 
              width: 486,
              backgroundColor: getDynamicBackground(searchCode),
            }}
            inputProps={{
              style: {
                fontSize: '15.5px', // Ajusta el tamaño del texto
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{
              minWidth: '40px', // Establece el tamaño mínimo para que sea un cuadrado
              height: '40px', // Asegura que sea un cuadrado
              padding: 0, // Sin padding adicional
              display: 'flex', // Para centrar el ícono
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SearchIcon />
          </Button>
        </Box>
      </Box>
    </Header>
  );
};

export default CustomHeader;