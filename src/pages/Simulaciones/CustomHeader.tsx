//CustomHeader.tsx  
import React, { useEffect, useState } from 'react';
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
import { nuevaDataPrueba } from '../../data/nuevaDataPrueba';
import { useSelection } from '../../context/Buscador/useSelection';
import useArchivos from '../../store/hooks/useArchivos';
import { mapearContenidoAArchivos } from '../../utils/mapearContenidoAArchivos';

const CustomHeader: React.FC = () => {

  // Estados locales
  const [searchCode, setSearchCode] = useState<string>('');
  const [tipo, setTipo] = useState("");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs('2024-12-01'));
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs('2024-12-01T12:00'));

  // Hooks de contexto
  const { state: simulationState, dispatch, userId, stopSimulation } = useData();
  const { setSelectedOficina, setSelectedCamion, setSelectedPedido } = useSelection();

  const { simulacion, fetchSimulacion } = useArchivos();

  useEffect(() => {
    fetchSimulacion();
  }, [fetchSimulacion]);

  const handleChange = (event: SelectChangeEvent) => {
    setTipo(event.target.value);
  };

  const startSimulation = async () => {
    if (selectedDate && selectedTime && tipo) {
      const startTime = new Date(
        selectedDate.year(),
        selectedDate.month(),
        selectedDate.date(),
        selectedTime.hour(),
        selectedTime.minute()
      );

      let endTime: Date;

      if (tipo === 'semanal') {
        console.log('MSJ: Iniciando simulación semanal');
        endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días después
      } else if (tipo === 'colapso') {
        console.log('MSJ: Iniciando simulación colapso');
        endTime = new Date(startTime.getTime() + 365 * 24 * 60 * 60 * 1000);
      } else {
        console.log('Emergencia, no se escogio ni semanal ni coplapso pero igual quiere ejecutarse');
        return;
      }

      dispatch({
        type: 'START_SIMULATION',
        payload: { startTime, endTime, operationType: tipo },
      });

      // Llama a handleIniciarSimulacion después de iniciar la simulación
      await handleIniciarSimulacion();
    }
  };

  const handleIniciarSimulacion = async () => {
    try {

      if (selectedDate && selectedTime && tipo) {
        const startTime = new Date(
          selectedDate.year(),
          selectedDate.month(),
          selectedDate.date(),
          selectedTime.hour(),
          selectedTime.minute()
        );

        let endTime: Date;

        if (tipo === 'semanal') {
          console.log('MSJ: Iniciando simulación semanal');
          endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días después
        } else if (tipo === 'colapso') {
          console.log('MSJ: Iniciando simulación colapso');
          endTime = new Date(startTime.getTime() + 365 * 24 * 60 * 60 * 1000);
        } else {
          console.log('Emergencia, no se escogio ni semanal ni coplapso pero igual quiere ejecutarse');
          return;
        }

        const pedidos = mapearContenidoAArchivos(simulacion, startTime, endTime);

        const formattedStartTime = dayjs(startTime).format('YYYY-MM-DDTHH:mm:ss');

        const dataPrueba = {
          ...nuevaDataPrueba,
          pedidos,
          fechaInicio: formattedStartTime,
        };

        console.log("Pedidos", pedidos);

        const response = await axios.post(
          `${ServicesProperties.BaseUrl}/simulacion/iniciar?userId=${userId}`, dataPrueba,
          { headers: ServicesProperties.Headers }
        );
        console.log('Simulación iniciada, respuesta del servidor:', response.data);
      }
    } catch (error) {
      console.error('Error al iniciar la simulación:', error);
    }
  };

  const getDynamicBackground = (value: Dayjs | string | null) => (value ? '#E6F0FB' : '#FAFAFA');

  // Actualizar todas las referencias a state por simulationState
  const handleSearch = () => {
    const query = searchCode.trim();

    setSelectedOficina(null);
    setSelectedCamion(null);
    setSelectedPedido(null);

    // Buscar en oficinas
    // const office = simulationState.offices.find((office) => office.ubigeo === query);
    // if (office) {
    //   setSelectedOficina(office);
    //   return;
    // }
    if (query.includes(',')) {
      const [departamento, provincia] = query.split(',').map(part => part.trim().toUpperCase());
      const office = simulationState.offices.find((office) =>
        office.departamento.toUpperCase() === departamento &&
        office.provincia.toUpperCase() === provincia
      );
      if (office) {
        setSelectedOficina(office);
        return;
      }
    }

    // Buscar en camiones
    const truck = simulationState.vehicles.find((vehicle) => vehicle.idVehiculo === query);
    if (truck) {
      setSelectedCamion(truck);
      return;
    }

    // Buscar en pedidos
    const allOrders = [
      ...simulationState.unplannedOrders,
      ...simulationState.vehicles.flatMap(vehicle => vehicle.ruta?.pedidos || [])
    ];

    const order = allOrders.find((order) =>
      order.idPedido.toUpperCase() === query
    );
    if (order) {
      setSelectedPedido(order);
      return;
    }

  };

  return (
    <Header isLoading={simulationState.isPlaying}>
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
            disabled={simulationState.isPlaying}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                size: 'small',
                placeholder: 'Fecha',
                sx: {
                  width: '149px',
                  backgroundColor: getDynamicBackground(selectedDate),
                },
                disabled: simulationState.isPlaying,
              },
            }}
          />
          <TimePicker
            value={selectedTime}
            onChange={(newValue) => setSelectedTime(newValue)}
            disabled={simulationState.isPlaying}
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
                disabled: simulationState.isPlaying,
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
            disabled={simulationState.isPlaying}
          >
            <Select
              displayEmpty
              value={tipo}
              onChange={handleChange}
              disabled={simulationState.isPlaying}
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
              <MenuItem value="semanal">Semanal</MenuItem>
              <MenuItem value="colapso">Hasta el colapso</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={simulationState.isPlaying ? stopSimulation : startSimulation}
            color={simulationState.isPlaying ? 'error' : 'primary'}
            sx={{
              minWidth: '40px', // Tamaño mínimo para igualarlo al botón de búsqueda
              height: '40px', // Igual altura que el botón de búsqueda
              padding: 0, // Sin padding adicional
              display: 'flex', // Para centrar el ícono
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {simulationState.isPlaying ? <Stop /> : <PlayArrow />}
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
            onClick={handleSearch}
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