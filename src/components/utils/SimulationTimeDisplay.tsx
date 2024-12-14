import React, { useEffect, useState } from 'react';
import { useData } from '../../context/useData';
import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
import { FaClock } from 'react-icons/fa';
import styles from './SimulationTimeDisplay.module.css';
//import { Button } from '@mui/material';

dayjs.extend(durationPlugin);

interface SimulationTimeDisplayProps {
  className?: string;
}

const SimulationTimeDisplay: React.FC<SimulationTimeDisplayProps> = ({ className }) => {
  const { state } = useData();
  const [executionStartTime, setExecutionStartTime] = useState<Date | null>(null);
  const [executionElapsedTime, setExecutionElapsedTime] = useState<number>(0);
  const [realTime, setRealTime] = useState(dayjs().format('DD/MM/YYYY, hh:mm A'));
  const [showPanel, setShowPanel] = useState(false);

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

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRealTime(dayjs().format('DD/MM/YYYY, hh:mm A'));
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const formatDateTime = (date: Date | null): string => {
    if (!date) return 'Simulación no iniciada';
    return dayjs(date).format('DD/MM/YYYY, hh:mm A');
  };

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

  const inicialReal = formatDateTime(executionStartTime);
  const actualReal = realTime;
  const transcurridoReal = executionTimeDisplay;

  const inicialSimulado = formatDateTime(state.startTime);
  const actualSimulado = simulationDateTimeDisplay;
  const transcurridoSimulado = simulationTimeDisplay;

  return (
    <>
      {/* <button className={styles.floatingButton} onClick={() => setShowPanel(!showPanel)}>
        <FaClock />
      </button> */}
      <button
        className={styles.floatingButton}
        onClick={() => setShowPanel(!showPanel)}
      >
        <FaClock />
      </button>

      {showPanel && (
        <div className={styles.panelContainer}>
          <table className={`${styles.timeTable} ${className}`}>
            <thead>
              <tr>
                <th className={styles.subHeader}>Tiempo</th>
                <th className={styles.subHeader}>Real</th>
                <th className={styles.subHeader}>Simulado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.keyCell}>Inicial</td>
                <td className={`${styles.valueCell} ${styles.highlightValue}`}>{inicialReal}</td>
                <td className={`${styles.valueCell} ${styles.highlightValue}`}>{inicialSimulado}</td>
              </tr>
              <tr>
                <td className={styles.keyCell}>Actual</td>
                <td className={`${styles.valueCell} ${styles.highlightValue}`}>{actualReal}</td>
                <td className={`${styles.valueCell} ${styles.highlightValue}`}>{actualSimulado}</td>
              </tr>
              <tr>
                <td className={`${styles.keyCell} ${styles.highlight}`}>Transcurrido</td>
                <td className={`${styles.valueCell} ${styles.highlightValue}`}>{transcurridoReal}</td>
                <td className={`${styles.valueCell} ${styles.highlightValue}`}>{transcurridoSimulado}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default SimulationTimeDisplay;
