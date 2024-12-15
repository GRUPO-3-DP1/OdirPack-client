import React, { useState } from 'react';
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
  IconButton,
  Typography
} from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { useData } from '../../context/useData';
import dayjs from 'dayjs';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import styles from './CustomHeader.module.css'; // Nuevo archivo CSS para estilos de posición

const CustomHeader: React.FC = () => {
  const { state: simulationState, isLoading, startSimulation, stopSimulation, updateStartTime, updateSimulationType } = useData();
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      {/* Contenedor para el título "Simulaciones" en la esquina superior izquierda */}
      <div className={styles.simulationTitleContainer}>
        <Box display="flex" alignItems="center" gap={1}>
          {/* Quitar color: '#FFF' para que use el color por defecto (negro, definido en CSS) */}
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Simulaciones
          </Typography>
          {/* Quitar color: '#FFF' del IconButton para que use el color de texto por defecto */}
          <IconButton size="small" onClick={handleToggle}>
            {expanded ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
          </IconButton>
        </Box>
      </div>

      {/* Contenido desplegable debajo del título */}
      {expanded && (
        <div className={styles.dropdownContainer}>
          <Box display="flex" alignItems="center" gap={2}>
            <DatePicker
              value={dayjs(simulationState.startTime)}
              onChange={(value) => { if (value) updateStartTime(value.toDate()); }}
              disabled={simulationState.isPlaying}
              format="DD/MM/YY"
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
                  padding: 0,
                },
                '.MuiOutlinedInput-notchedOutline': {
                  borderWidth: '1px',
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
              onClick={simulationState.isPlaying ? stopSimulation : startSimulation}
              color={simulationState.isPlaying ? 'error' : 'primary'}
              disabled={isLoading}
              sx={{
                minWidth: '40px',
                height: '40px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {simulationState.isPlaying ? <Stop /> : <PlayArrow />}
            </Button>
          </Box>
        </div>
      )}
    </>
  );
};

export default CustomHeader;
