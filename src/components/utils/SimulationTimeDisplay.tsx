// SimulationTimeDisplay.tsx
import React, { useEffect, useState } from 'react';
import { useSimulation } from '../../context/Simulacion/useSimulation';
import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
import styles from './SimulationTimeDisplay.module.css';

dayjs.extend(durationPlugin);

interface SimulationTimeDisplayProps {
  className?: string;
}

const SimulationTimeDisplay: React.FC<SimulationTimeDisplayProps> = ({ className }) => {
  const { state } = useSimulation();

  const [executionStartTime, setExecutionStartTime] = useState<Date | null>(null);
  const [executionElapsedTime, setExecutionElapsedTime] = useState<number>(0);

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
      {/* Agrupa Tiempo de ejecución y Tiempo en simulación en una fila */}
      <div className={styles.simulationRow}>
        <span><strong>Tiempo de ejecución:&nbsp;</strong>{executionTimeDisplay}</span>
        <span><strong>Tiempo en simulación:&nbsp;</strong>{simulationTimeDisplay}</span>
      </div>
  
      {/* Muestra Fecha y hora en simulación en una línea separada */}
      <span><strong>Fecha y hora en simulación:&nbsp;</strong>{simulationDateTimeDisplay}</span>
    </div>
  );
};

export default SimulationTimeDisplay;
