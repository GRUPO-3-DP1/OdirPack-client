import React, { useEffect, useState } from 'react';
import { useData } from '../../context/useData';
import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
import styles from './SimulationTimeDisplay.module.css';
import { Divider, Typography } from '@mui/material';
dayjs.extend(durationPlugin);

interface SimulationTimeDisplayProps {
  className?: string;
}

const SimulationTimeDisplay: React.FC<SimulationTimeDisplayProps> = ({ className }) => {
  const { state } = useData();
  const [executionStartTime, setExecutionStartTime] = useState<Date | null>(null);
  const [executionElapsedTime, setExecutionElapsedTime] = useState<number>(0);
  const [realTime, setRealTime] = useState(dayjs().format('DD/MM/YYYY, hh:mm A'));

  // Existing execution time useEffect
  useEffect(() => {
    let intervalId: number | null = null;
    if (state.isPlaying) {
      if (!executionStartTime) {
        setExecutionStartTime(new Date());
      }
      intervalId = window.setInterval(() => {
        setExecutionElapsedTime(Date.now() - (executionStartTime?.getTime() || Date.now()));
      }, 1000);
    } else {
      if (executionStartTime) {
        setExecutionStartTime(null);
        setExecutionElapsedTime(0);
      }
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    }
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [state.isPlaying, executionStartTime]);

  // New useEffect for updating real-time
  useEffect(() => {
    const intervalId = setInterval(() => {
      setRealTime(dayjs().format('DD/MM/YYYY, hh:mm A'));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatExecutionTime = (milliseconds: number): string => {
    const timeDuration = dayjs.duration(milliseconds);
    const minutes = Math.floor(timeDuration.asMinutes());
    const seconds = timeDuration.seconds();
    return `${minutes}m ${seconds}s`;
  };

  const formatSimulationTime = (elapsedTime: number): string => {
    const timeDuration = dayjs.duration(elapsedTime);
    const days = Math.floor(timeDuration.asDays());
    const hours = timeDuration.hours();
    const minutes = timeDuration.minutes();
    let formatted = '';
    if (days > 0) {
      formatted += `${days}d `;
    }
    formatted += `${hours}h ${minutes}m`;
    return formatted.trim();
  };

  const executionTimeDisplay = state.isPlaying ? formatExecutionTime(executionElapsedTime) : '0m 0s';

  const simulationElapsedTime = state.isPlaying
    ? state.currentTime.getTime() - state.startTime.getTime()
    : 0;

  const simulationTimeDisplay = state.isPlaying ? formatSimulationTime(simulationElapsedTime) : '0d 0h 0m';

  const simulationDateTimeDisplay = state.isPlaying
    ? dayjs(state.currentTime).format('DD/MM/YYYY, hh:mm A')
    : 'Simulación no iniciada';

  return (
    <div className={`${className} ${styles.simulationTimeDisplay}`}>
      <div className={styles.tiempo}>
        <Typography variant="subtitle1" color="textPrimary">
          <b>
            Tiempo real:
          </b>
        </Typography>
        <Typography variant="text" color="textPrimary">
          <span><strong>Fecha y hora:&nbsp;</strong>{realTime}</span>
        </Typography>
        <Typography variant="text" color="textPrimary">
          <span><strong>Tiempo transcurrido:&nbsp;</strong>{executionTimeDisplay}</span>
        </Typography>
      </div>
      <Divider orientation="vertical" flexItem />
      <div className={styles.tiempo}>
        <Typography variant="subtitle1" color="textPrimary">
          <b>
            Simulación:
          </b>
        </Typography>
        <Typography variant="text" color="textPrimary">
          <span><strong>Fecha y hora:&nbsp;</strong>{simulationDateTimeDisplay}</span>
        </Typography>
        <Typography variant="text" color="textPrimary">
          <span><strong>Tiempo transcurrido:&nbsp;</strong>{simulationTimeDisplay}</span>
        </Typography>
      </div>
    </div>
  );
};

export default SimulationTimeDisplay;