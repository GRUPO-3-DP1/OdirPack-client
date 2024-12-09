//CustomHeader.tsx  
import React, { useEffect } from 'react';
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
} from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { useData } from '../../context/useData';
import dayjs from 'dayjs';
import axios from 'axios';
import { Services as ServicesProperties } from '../../../config';
import { nuevaDataPrueba } from '../../data/nuevaDataPrueba';
import usePedidosSimulacion from '../../store/hooks/usePedidosSimulacion';
import { mapearPedidosDeArchivos } from '../../utils/mapearPedidosDeArchivos';

const CustomHeader: React.FC = () => {
  const { state: simulationState, userId, startSimulation, stopSimulation, updateStartTime, updateSimulationType } = useData();

  const { pedidosSimulacion, fetchPedidosSimulacion } = usePedidosSimulacion();

  useEffect(() => {
    fetchPedidosSimulacion();
  }, [fetchPedidosSimulacion]);

  const handleIniciarSimulacion = async () => {
    try {
      if (simulationState.startTime && simulationState.operationType) {

        const pedidos = mapearPedidosDeArchivos(pedidosSimulacion, simulationState.startTime, simulationState.endTime);

        const formattedStartTime = dayjs(simulationState.startTime).format('YYYY-MM-DDTHH:mm:ss');

        const dataPrueba = {
          ...nuevaDataPrueba,
          pedidos,
          fechaInicio: formattedStartTime,
        };

        console.log("Pedidos mapeados: ", pedidos);

        const response = await axios.post(
          `${ServicesProperties.BaseUrl}/simulacion/iniciar?userId=${userId}`, dataPrueba,
          { headers: ServicesProperties.Headers }
        );
        console.log('Simulación iniciada, respuesta del servidor:', response.data);
        startSimulation();
      }
    } catch (error) {
      console.error('Error al iniciar la simulación:', error);
    }
  };

  return (
    <Header isLoading={simulationState.isPlaying}>
      <Box
        display="flex"
        flexDirection="column"
        gap={1}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <DatePicker
            value={dayjs(simulationState.startTime)}
            onChange={(value) => { if (value) updateStartTime(value.toDate()); }}
            disabled={simulationState.isPlaying}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                size: 'small',
                placeholder: 'Fecha',
                sx: {
                  width: '149px'
                },
              },
            }}
          />
          <TimePicker
            value={dayjs(simulationState.startTime)}
            onChange={(value) => { if (value) updateStartTime(value.toDate()); }}
            disabled={simulationState.isPlaying}
            views={['hours', 'minutes']}
            ampm
            slotProps={{
              textField: {
                size: 'small',
                placeholder: 'Hora',
                sx: {
                  width: '135px',
                },
              },
            }}
          />
          <FormControl
            size="small"
            sx={{
              width: '170px',
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
              value={simulationState.operationType}
              onChange={(event) => updateSimulationType(event.target.value as "SEMANAL" | "COLAPSO")}
              disabled={simulationState.isPlaying}
            >
              <MenuItem value="SEMANAL">SEMANAL</MenuItem>
              <MenuItem value="COLAPSO">HASTA COLAPSO</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={simulationState.isPlaying ? stopSimulation : handleIniciarSimulacion}
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
      </Box>
    </Header>
  );
};

export default CustomHeader;