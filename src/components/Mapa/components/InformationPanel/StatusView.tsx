import React from 'react';
import SimulationTimeDisplay from '../../../utils/SimulationTimeDisplay';
import styles from './InformationPanel.module.css';

const StatusView: React.FC = () => {
  return (
    <div className={styles.timeDisplayContainer}>
      <SimulationTimeDisplay />
    </div>
  );
};

export default StatusView;